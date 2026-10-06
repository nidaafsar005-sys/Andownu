from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from app.core.config import settings
from app.services.download_service import download_manager
from app.providers.registry import get_all_platforms_info, toggle_provider

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class ToggleProviderRequest(BaseModel):
    provider_id: str
    enabled: bool

# Simple in-memory token check for demo/admin auth
ADMIN_TOKEN = "andown_sec_admin_token_2026_xyz"

def verify_admin(authorization: str = Header(None)):
    if not authorization or authorization.replace("Bearer ", "").strip() != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized admin access.")

@router.post("/login")
def admin_login(payload: AdminLoginRequest):
    if payload.email == settings.ADMIN_EMAIL and payload.password == "admin123":
        return {
            "token": ADMIN_TOKEN,
            "user": {"email": settings.ADMIN_EMAIL, "role": "admin"}
        }
    raise HTTPException(status_code=401, detail="Invalid admin credentials.")

@router.get("/stats", dependencies=[Depends(verify_admin)])
def get_admin_stats():
    """Returns genuine operational stats, bandwidth, and job counts."""
    jobs = list(download_manager.jobs.values())
    active_jobs = [j for j in jobs if j["status"] in ["queued", "processing"]]
    
    # Calculate platforms distribution
    platform_counts: Dict[str, int] = {}
    for j in jobs:
        plat = "generic"
        if j.get("media_info") and j["media_info"].platform:
            plat = j["media_info"].platform
        platform_counts[plat] = platform_counts.get(plat, 0) + 1

    return {
        "metrics": {
            "total_requests": download_manager.stats["total_requests"],
            "successful_downloads": download_manager.stats["successful_downloads"],
            "failed_downloads": download_manager.stats["failed_downloads"],
            "active_jobs": len(active_jobs),
            "today_requests": download_manager.stats["today_requests"],
            "bandwidth_formatted": f"{download_manager.stats['bandwidth_bytes'] / (1024*1024):.2f} MB",
            "storage_usage": f"{sum(j.get('filesize_bytes', 0) for j in jobs if j.get('filepath')) / (1024*1024):.2f} MB"
        },
        "platforms": get_all_platforms_info(),
        "recent_jobs": jobs[-20:][::-1],
        "platform_distribution": platform_counts
    }

@router.post("/platform/toggle", dependencies=[Depends(verify_admin)])
def admin_toggle_platform(payload: ToggleProviderRequest):
    ok = toggle_provider(payload.provider_id, payload.enabled)
    if not ok:
        raise HTTPException(status_code=404, detail="Platform not found.")
    return {"message": f"Platform {payload.provider_id} status updated to {payload.enabled}"}
