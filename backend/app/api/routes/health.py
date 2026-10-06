from typing import List
from fastapi import APIRouter
from app.models.media import HealthResponse, PlatformItem
from app.providers.registry import get_all_platforms_info
from app.services.download_service import download_manager

router = APIRouter(tags=["System"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    active = sum(1 for j in download_manager.jobs.values() if j["status"] in ["queued", "processing"])
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="Andown Universal Video Downloader Engine",
        queue_status="active",
        worker_status="running",
        active_jobs=active
    )

@router.get("/providers", response_model=List[PlatformItem])
def list_providers():
    return get_all_platforms_info()
