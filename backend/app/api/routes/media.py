import os
import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import FileResponse

from app.models.media import (
    MediaInfoRequest, MediaProcessRequest, MediaInfo, JobResponse, JobStatus, PlatformItem
)
from app.core.security import validate_and_normalize_url
from app.core.rate_limiter import rate_limit_check
from app.core.config import settings
from app.core.logging import logger
from app.providers.registry import detect_provider, get_all_platforms_info
from app.services.download_service import download_manager

router = APIRouter(prefix="/media", tags=["Media Engine"])

@router.post("/info", response_model=MediaInfo, dependencies=[Depends(rate_limit_check)])
async def get_media_info(payload: MediaInfoRequest):
    """
    Analyzes submitted video URL, checks SSRF safety, detects provider, 
    and returns genuine platform metadata & formats.
    """
    clean_url, domain = validate_and_normalize_url(payload.url)
    provider = detect_provider(clean_url)
    
    if not provider:
        raise HTTPException(status_code=400, detail="This platform is not currently supported.")
        
    logger.info(f"Extracting media info for domain '{domain}' using provider '{provider.id}'")
    media_info = await provider.get_info(clean_url)
    return media_info

@router.post("/process", response_model=JobResponse, dependencies=[Depends(rate_limit_check)])
async def process_media(payload: MediaProcessRequest, background_tasks: BackgroundTasks):
    """
    Queues a media processing & download task asynchronously.
    Returns tracking job ID and initial status.
    """
    clean_url, domain = validate_and_normalize_url(payload.url)
    provider = detect_provider(clean_url)
    
    if not provider:
        raise HTTPException(status_code=400, detail="This platform is not currently supported.")

    # Fetch brief metadata to associate with job
    try:
        info = await provider.get_info(clean_url)
    except Exception:
        info = None

    job_id = download_manager.create_job(
        url=clean_url,
        format_id=payload.format_id,
        ext=payload.ext or "mp4",
        is_audio_only=payload.is_audio_only,
        media_info=info
    )

    # Dispatch to background task
    background_tasks.add_task(download_manager.execute_job, job_id)

    job = download_manager.get_job(job_id)
    return JobResponse(
        job_id=job_id,
        status=job["status"],
        progress_percentage=job["progress_percentage"],
        status_message=job["status_message"],
        media_info=job["media_info"],
        expires_at=job["expires_at"]
    )

@router.get("/status/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    """
    Polls status of a queued/processing download job.
    """
    job = download_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or has expired.")

    download_url = None
    if job["status"] == JobStatus.COMPLETED and job["filepath"]:
        download_url = f"{settings.API_V1_STR}/media/download/{job_id}"

    return JobResponse(
        job_id=job_id,
        status=job["status"],
        progress_percentage=job["progress_percentage"],
        status_message=job["status_message"],
        download_url=download_url,
        filename=job["filename"],
        filesize_formatted=job["filesize_formatted"],
        media_info=job["media_info"],
        expires_at=job["expires_at"],
        error=job["error"]
    )

@router.get("/download/{job_id}")
async def download_file(job_id: str):
    """
    Transfers the real finalized video/audio file with Content-Disposition headers.
    """
    job = download_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Download link has expired.")

    if job["status"] != JobStatus.COMPLETED or not job["filepath"]:
        raise HTTPException(status_code=400, detail="File is not ready for download.")

    filepath = job["filepath"]
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File no longer exists on server.")

    filename = job["filename"] or os.path.basename(filepath)
    ext = os.path.splitext(filename)[1].lower()
    media_type = "video/mp4" if ext == ".mp4" else ("audio/mp4" if ext in [".m4a", ".mp3"] else "application/octet-stream")
    
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type=media_type
    )

@router.post("/cancel/{job_id}")
async def cancel_download_job(job_id: str):
    """
    Cancels an active or queued download job.
    """
    success = download_manager.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=400, detail="Job could not be cancelled or already finished.")
    return {"message": "Job successfully cancelled", "job_id": job_id}
