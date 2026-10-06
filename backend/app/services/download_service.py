import os
import uuid
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Optional
import yt_dlp
import imageio_ffmpeg

from app.core.config import settings
from app.core.logging import logger
from app.core.security import sanitize_filename
from app.models.media import JobStatus, JobResponse, MediaInfo

# Ensure imageio_ffmpeg binary is available in PATH for yt-dlp
try:
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    if ffmpeg_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
    logger.info(f"Configured FFmpeg binary at: {ffmpeg_exe}")
except Exception as e:
    ffmpeg_exe = None
    logger.warning(f"Could not automatically locate imageio_ffmpeg binary: {e}")

class DownloadManager:
    """In-memory async job manager tracking download tasks, progress, and file paths."""
    
    def __init__(self):
        self.jobs: Dict[str, Dict] = {}
        self.stats = {
            "total_requests": 0,
            "successful_downloads": 0,
            "failed_downloads": 0,
            "today_requests": 0,
            "bandwidth_bytes": 0
        }

    def create_job(self, url: str, format_id: str, ext: str, is_audio_only: bool, media_info: Optional[MediaInfo] = None) -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "job_id": job_id,
            "url": url,
            "format_id": format_id,
            "ext": ext or "mp4",
            "is_audio_only": is_audio_only,
            "status": JobStatus.QUEUED,
            "progress_percentage": 0,
            "status_message": "Preparing download...",
            "filepath": None,
            "filename": None,
            "filesize_bytes": 0,
            "filesize_formatted": None,
            "media_info": media_info,
            "created_at": time.time(),
            "expires_at": (datetime.utcnow() + timedelta(minutes=settings.FILE_EXPIRATION_MINUTES)).isoformat() + "Z",
            "error": None,
            "cancelled": False
        }
        self.stats["total_requests"] += 1
        self.stats["today_requests"] += 1
        return job_id

    def get_job(self, job_id: str) -> Optional[Dict]:
        return self.jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        job = self.jobs.get(job_id)
        if job and job["status"] in [JobStatus.QUEUED, JobStatus.PROCESSING]:
            job["cancelled"] = True
            job["status"] = JobStatus.CANCELLED
            job["status_message"] = "Download was cancelled."
            return True
        return False

    async def execute_job(self, job_id: str):
        job = self.jobs.get(job_id)
        if not job or job.get("cancelled"):
            return

        job["status"] = JobStatus.PROCESSING
        job["status_message"] = "Fetching media stream..."
        job["progress_percentage"] = 15

        title = "video"
        if job.get("media_info") and job["media_info"].title:
            title = job["media_info"].title
        safe_title = sanitize_filename(f"Andown - {title}")
        out_template = os.path.join(settings.DOWNLOAD_DIR, f"{job_id}_{safe_title}.%(ext)s")

        # Custom progress hook for honest progress updates
        def ydl_progress_hook(d):
            if job.get("cancelled"):
                raise Exception("Job cancelled by user.")
            if d['status'] == 'downloading':
                total = d.get('total_bytes') or d.get('total_bytes_estimate')
                downloaded = d.get('downloaded_bytes', 0)
                if total and total > 0:
                    pct = int((downloaded / total) * 80) + 15
                    job["progress_percentage"] = min(pct, 95)
                    job["status_message"] = f"Downloading... {job['progress_percentage']}%"
                else:
                    job["status_message"] = "Downloading stream..."
            elif d['status'] == 'finished':
                job["status_message"] = "Finalizing media file..."
                job["progress_percentage"] = 96

        format_selector = job["format_id"]
        
        # Build smart format selector that prioritizes universal compatible H.264/AAC MP4 streams
        if job["is_audio_only"]:
            format_selector = "bestaudio[ext=m4a]/bestaudio/best"
        elif not format_selector or format_selector in ["best", "bestvideo+bestaudio/best"]:
            # Prefer 1080p/720p H.264 video with AAC audio merged into MP4
            format_selector = "bestvideo[vcodec^=avc1][height<=1080]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/bestvideo+bestaudio/best"
        else:
            format_selector = f"{format_selector}+bestaudio[ext=m4a]/{format_selector}+bestaudio/{format_selector}/best"

        ydl_opts = {
            'format': format_selector,
            'outtmpl': out_template,
            'progress_hooks': [ydl_progress_hook],
            'noplaylist': True,
            'quiet': True,
            'no_warnings': True,
            'socket_timeout': 30,
            'max_filesize': settings.MAX_DOWNLOAD_SIZE_MB * 1024 * 1024,
            # Remux/merge into playable MP4 container
            'merge_output_format': 'mp4' if not job["is_audio_only"] else None,
        }

        # Provide ffmpeg location directly to yt-dlp
        if ffmpeg_exe and os.path.exists(ffmpeg_exe):
            ydl_opts['ffmpeg_location'] = ffmpeg_exe

        # If audio only, extract audio cleanly
        if job["is_audio_only"]:
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': job["ext"] if job["ext"] in ["mp3", "m4a"] else "m4a",
                'preferredquality': '192',
            }]

        loop = asyncio.get_event_loop()
        try:
            def run_dl():
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(job["url"], download=True)
                    return info

            info = await loop.run_in_executor(None, run_dl)
            
            # Find the generated output file (filter out intermediate .part or .ytdl fragments)
            downloaded_files = [
                os.path.join(settings.DOWNLOAD_DIR, f)
                for f in os.listdir(settings.DOWNLOAD_DIR)
                if f.startswith(f"{job_id}_") and not f.endswith(".part") and not f.endswith(".ytdl")
            ]
            
            if not downloaded_files:
                raise Exception("Media downloaded but resulting final file could not be located.")

            # Pick the largest/final merged file
            downloaded_files.sort(key=lambda p: os.path.getsize(p), reverse=True)
            actual_file = downloaded_files[0]

            # If video container is transport stream (.mp4 filename but mpegts/raw content), remux into clean MP4
            if not job["is_audio_only"] and ffmpeg_exe:
                try:
                    with open(actual_file, 'rb') as f_chk:
                        header_bytes = f_chk.read(16)
                    # 0x47 is MPEG-TS sync byte
                    if header_bytes and header_bytes[0] == 0x47:
                        clean_target = actual_file + ".clean.mp4"
                        import subprocess
                        remux_cmd = [ffmpeg_exe, '-y', '-i', actual_file, '-c', 'copy', clean_target]
                        subprocess.run(remux_cmd, check=True, capture_output=True)
                        if os.path.exists(clean_target) and os.path.getsize(clean_target) > 0:
                            os.remove(actual_file)
                            os.rename(clean_target, actual_file)
                except Exception as remux_err:
                    logger.warning(f"Remux check non-critical warning: {remux_err}")

            file_stat = os.stat(actual_file)
            file_size = file_stat.st_size
            final_filename = os.path.basename(actual_file).replace(f"{job_id}_", "")

            job["filepath"] = actual_file
            job["filename"] = final_filename
            job["filesize_bytes"] = file_size
            job["filesize_formatted"] = f"{file_size / (1024*1024):.2f} MB"
            job["progress_percentage"] = 100
            job["status"] = JobStatus.COMPLETED
            job["status_message"] = "Ready!"
            
            self.stats["successful_downloads"] += 1
            self.stats["bandwidth_bytes"] += file_size
            logger.info(f"Successfully processed job {job_id}: {final_filename} ({job['filesize_formatted']})")

        except Exception as e:
            msg = str(e)
            logger.error(f"Job {job_id} failed: {msg}")
            job["status"] = JobStatus.FAILED
            job["status_message"] = "Processing failed."
            if "cancelled" in msg.lower():
                job["status"] = JobStatus.CANCELLED
                job["status_message"] = "Download was cancelled."
            elif "File is larger than max-filesize" in msg:
                job["error"] = f"The requested video exceeds our maximum size limit of {settings.MAX_DOWNLOAD_SIZE_MB}MB."
            elif "Private video" in msg or "Sign in" in msg:
                job["error"] = "This content appears to be private or requires authentication."
            else:
                job["error"] = "We couldn't process this video. Please try another format or URL."
            self.stats["failed_downloads"] += 1

download_manager = DownloadManager()
