import asyncio
from typing import List, Optional, Dict, Any
from urllib.parse import urlparse
import yt_dlp
from fastapi import HTTPException

from app.providers.base import BaseProvider
from app.models.media import MediaInfo, MediaFormat
from app.core.logging import logger

class GenericYtDlpProvider(BaseProvider):
    """
    Modular provider powered by yt-dlp.
    Specialized subclasses define domain detection, platform branding, and custom parameters.
    """
    
    def __init__(self, provider_id: str, name: str, domains: List[str], icon: str, desc: str):
        self.id = provider_id
        self.name = name
        self.domains = domains
        self.icon_name = icon
        self.description = desc
        self.is_enabled = True

    def detect(self, url: str) -> bool:
        try:
            parsed = urlparse(url)
            host = (parsed.hostname or "").lower()
            for d in self.domains:
                if host == d or host.endswith("." + d):
                    return True
        except Exception:
            return False
        return False

    def _extract_ydl_info(self, url: str) -> Dict[str, Any]:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'extract_flat': False,
            'socket_timeout': 15,
            'noplaylist': True,
            'ignoreerrors': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    async def get_info(self, url: str) -> MediaInfo:
        if not self.is_enabled:
            raise HTTPException(status_code=503, detail=f"{self.name} downloads are temporarily unavailable.")
            
        loop = asyncio.get_event_loop()
        try:
            info = await loop.run_in_executor(None, self._extract_ydl_info, url)
        except yt_dlp.utils.DownloadError as e:
            msg = str(e)
            logger.warning(f"DownloadError extracting info for {url}: {msg}")
            if "Private video" in msg or "Sign in" in msg or "login" in msg.lower():
                raise HTTPException(status_code=403, detail="This content appears to be private or requires authentication.")
            elif "not available" in msg.lower() or "deleted" in msg.lower():
                raise HTTPException(status_code=404, detail="This video is currently unavailable or deleted.")
            elif "copyright" in msg.lower():
                raise HTTPException(status_code=403, detail="This media cannot be processed due to copyright restrictions.")
            else:
                raise HTTPException(status_code=422, detail="We couldn't process this video. Please check the URL and try again.")
        except Exception as e:
            logger.error(f"Unexpected error extracting {url}: {e}")
            raise HTTPException(status_code=500, detail="Something went wrong while analyzing the video. Please try again.")

        if not info:
            raise HTTPException(status_code=404, detail="No media information found for this URL.")

        # Process formats
        formats_list: List[MediaFormat] = []
        raw_formats = info.get("formats", [])
        
        # Categorize formats cleanly
        seen_qualities = set()
        
        # Audio extraction options
        audio_added = False
        
        for f in raw_formats:
            vcodec = f.get("vcodec", "none")
            acodec = f.get("acodec", "none")
            has_video = vcodec != "none" and vcodec is not None
            has_audio = acodec != "none" and acodec is not None
            ext = f.get("ext", "mp4")
            height = f.get("height")
            filesize = f.get("filesize") or f.get("filesize_approx")
            
            # Pure Audio
            if not has_video and has_audio:
                if not audio_added or (filesize and filesize > 1000000):
                    formats_list.append(MediaFormat(
                        format_id=f.get("format_id", "bestaudio"),
                        format_note=f.get("format_note") or "Audio Stream",
                        resolution="Audio Only",
                        quality_label="Audio (M4A/MP3)",
                        ext=ext if ext in ["m4a", "mp3"] else "m4a",
                        filesize_approx=filesize,
                        filesize_formatted=self.format_bytes(filesize),
                        is_audio_only=True,
                        has_video=False,
                        has_audio=True,
                        vcodec=None,
                        acodec=acodec
                    ))
                    audio_added = True
                    
            # Video stream
            elif has_video:
                if height and height > 0:
                    quality = f"{height}p"
                else:
                    quality = f.get("format_note") or "Standard Video"
                    
                # To prevent spamming 100 variations of 1080p, pick top distinct video options
                key = f"{quality}_{ext}"
                if key not in seen_qualities:
                    seen_qualities.add(key)
                    formats_list.append(MediaFormat(
                        format_id=str(f.get("format_id")),
                        format_note=f.get("format_note"),
                        resolution=f"{f.get('width', '')}x{height}" if height else None,
                        quality_label=quality,
                        ext=ext if ext in ["mp4", "webm"] else "mp4",
                        filesize_approx=filesize,
                        filesize_formatted=self.format_bytes(filesize),
                        is_audio_only=False,
                        has_video=True,
                        has_audio=has_audio,
                        vcodec=vcodec,
                        acodec=acodec
                    ))

        # Always guarantee a 'Best Quality MP4' option if formats were stripped
        if not any(not fmt.is_audio_only for fmt in formats_list):
            formats_list.insert(0, MediaFormat(
                format_id="bestvideo+bestaudio/best",
                format_note="Best Available Quality",
                resolution=f"{info.get('width', '')}x{info.get('height', '')}" if info.get('height') else "HD",
                quality_label="Best Quality MP4",
                ext="mp4",
                filesize_approx=info.get("filesize") or info.get("filesize_approx"),
                filesize_formatted=self.format_bytes(info.get("filesize") or info.get("filesize_approx")),
                is_audio_only=False,
                has_video=True,
                has_audio=True
            ))

        # Sort formats: high resolutions first, audio at bottom
        def sort_key(fmt: MediaFormat):
            if fmt.is_audio_only:
                return -1
            res_num = 0
            if fmt.quality_label and "p" in fmt.quality_label:
                try:
                    res_num = int(fmt.quality_label.replace("p", "").strip())
                except ValueError:
                    res_num = 0
            return res_num

        formats_list.sort(key=sort_key, reverse=True)

        return MediaInfo(
            id=str(info.get("id", "media")),
            title=info.get("title", "Untitled Media"),
            description=info.get("description", "")[:280] if info.get("description") else None,
            thumbnail=info.get("thumbnail"),
            duration=info.get("duration"),
            duration_formatted=self.format_duration(info.get("duration")),
            uploader=info.get("uploader") or info.get("channel"),
            platform=self.id,
            webpage_url=url,
            formats=formats_list
        )
