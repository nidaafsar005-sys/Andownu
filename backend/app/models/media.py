from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class MediaFormat(BaseModel):
    format_id: str
    format_note: Optional[str] = None  # e.g., "1080p", "720p", "Audio 128k"
    resolution: Optional[str] = None   # e.g., "1920x1080", "1280x720"
    quality_label: Optional[str] = None # e.g. "1080p", "720p", "480p", "360p", "Audio"
    ext: str                           # e.g., "mp4", "m4a", "mp3"
    filesize_approx: Optional[int] = None # In bytes
    filesize_formatted: Optional[str] = None # e.g., "24.5 MB"
    is_audio_only: bool = False
    has_video: bool = True
    has_audio: bool = True
    vcodec: Optional[str] = None
    acodec: Optional[str] = None

class MediaInfo(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[int] = None # in seconds
    duration_formatted: Optional[str] = None # e.g. "04:12"
    uploader: Optional[str] = None
    platform: str # e.g. "youtube", "instagram"
    webpage_url: str
    formats: List[MediaFormat] = []

class MediaInfoRequest(BaseModel):
    url: str

class MediaProcessRequest(BaseModel):
    url: str
    format_id: str
    ext: Optional[str] = "mp4"
    is_audio_only: bool = False

class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress_percentage: Optional[int] = None
    status_message: str
    download_url: Optional[str] = None
    filename: Optional[str] = None
    filesize_formatted: Optional[str] = None
    media_info: Optional[MediaInfo] = None
    expires_at: Optional[str] = None
    error: Optional[str] = None

class PlatformItem(BaseModel):
    id: str
    name: str
    domains: List[str]
    is_enabled: bool = True
    supported_media: List[str] = ["Videos", "Audio", "Clips"]
    icon_name: str
    description: str

class HealthResponse(BaseModel):
    status: str
    version: str
    service: str
    queue_status: str
    worker_status: str
    active_jobs: int
