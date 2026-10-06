from typing import List, Dict, Optional
from urllib.parse import urlparse
from fastapi import HTTPException

from app.providers.base import BaseProvider
from app.providers.generic import GenericYtDlpProvider
from app.models.media import PlatformItem

# Initialize Provider Registry
PROVIDERS: Dict[str, BaseProvider] = {
    "youtube": GenericYtDlpProvider(
        provider_id="youtube",
        name="YouTube",
        domains=["youtube.com", "youtu.be", "music.youtube.com"],
        icon="youtube",
        desc="Download public YouTube videos, Shorts, and audio formats."
    ),
    "facebook": GenericYtDlpProvider(
        provider_id="facebook",
        name="Facebook",
        domains=["facebook.com", "fb.watch"],
        icon="facebook",
        desc="Save public Facebook videos and Reels in MP4."
    ),
    "instagram": GenericYtDlpProvider(
        provider_id="instagram",
        name="Instagram",
        domains=["instagram.com", "instagr.am"],
        icon="instagram",
        desc="Download public Instagram Reels, videos, and clips."
    ),
    "tiktok": GenericYtDlpProvider(
        provider_id="tiktok",
        name="TikTok",
        domains=["tiktok.com"],
        icon="tiktok",
        desc="Fast TikTok video downloads in HD quality."
    ),
    "twitter": GenericYtDlpProvider(
        provider_id="twitter",
        name="X / Twitter",
        domains=["twitter.com", "x.com"],
        icon="twitter",
        desc="Download public video posts and clips from X."
    ),
    "reddit": GenericYtDlpProvider(
        provider_id="reddit",
        name="Reddit",
        domains=["reddit.com", "v.redd.it"],
        icon="reddit",
        desc="Extract high quality video and audio from Reddit posts."
    ),
    "pinterest": GenericYtDlpProvider(
        provider_id="pinterest",
        name="Pinterest",
        domains=["pinterest.com", "pin.it"],
        icon="pinterest",
        desc="Download public video pins and ideas directly."
    ),
    "vimeo": GenericYtDlpProvider(
        provider_id="vimeo",
        name="Vimeo",
        domains=["vimeo.com"],
        icon="vimeo",
        desc="Download public high-definition Vimeo videos."
    ),
    "dailymotion": GenericYtDlpProvider(
        provider_id="dailymotion",
        name="Dailymotion",
        domains=["dailymotion.com", "dai.ly"],
        icon="dailymotion",
        desc="Fast Dailymotion video stream conversion."
    ),
    "twitch": GenericYtDlpProvider(
        provider_id="twitch",
        name="Twitch",
        domains=["twitch.tv"],
        icon="twitch",
        desc="Save public Twitch gaming clips and highlights."
    ),
    "linkedin": GenericYtDlpProvider(
        provider_id="linkedin",
        name="LinkedIn",
        domains=["linkedin.com"],
        icon="linkedin",
        desc="Download public educational and post videos."
    ),
    "generic": GenericYtDlpProvider(
        provider_id="generic",
        name="Universal Web",
        domains=[],
        icon="globe",
        desc="Universal extractor for other supported public web videos."
    )
}

def detect_provider(url: str) -> Optional[BaseProvider]:
    """Detect appropriate provider based on domain and URL match."""
    for key, provider in PROVIDERS.items():
        if key == "generic":
            continue
        if provider.detect(url):
            return provider
    return PROVIDERS["generic"]

def get_all_platforms_info() -> List[PlatformItem]:
    """Return platform metadata and current status for UI & Admin."""
    result = []
    for key, prov in PROVIDERS.items():
        if key == "generic":
            continue
        result.append(PlatformItem(
            id=prov.id,
            name=prov.name,
            domains=prov.domains,
            is_enabled=prov.is_enabled,
            icon_name=prov.icon_name,
            description=prov.description,
            supported_media=["MP4 Video", "M4A Audio", "Full HD"]
        ))
    return result

def toggle_provider(provider_id: str, enabled: bool) -> bool:
    """Admin runtime toggle for providers without redeployment."""
    if provider_id in PROVIDERS:
        PROVIDERS[provider_id].is_enabled = enabled
        return True
    return False
