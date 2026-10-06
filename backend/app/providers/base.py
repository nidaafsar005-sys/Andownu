import abc
import os
from typing import List, Optional, Tuple
from app.models.media import MediaInfo, MediaFormat

class BaseProvider(abc.ABC):
    """Abstract Base Class for all Video Platform Providers."""
    
    id: str = "base"
    name: str = "Base Provider"
    domains: List[str] = []
    icon_name: str = "video"
    description: str = ""
    is_enabled: bool = True
    
    @abc.abstractmethod
    def detect(self, url: str) -> bool:
        """Return True if this provider can handle the given URL."""
        pass

    @abc.abstractmethod
    async def get_info(self, url: str) -> MediaInfo:
        """Fetch media metadata and available formats for the given URL."""
        pass

    def format_bytes(self, size_bytes: Optional[int]) -> Optional[str]:
        if not size_bytes or size_bytes <= 0:
            return None
        units = ['B', 'KB', 'MB', 'GB']
        s = float(size_bytes)
        for u in units:
            if s < 1024.0 or u == 'GB':
                return f"{s:.1f} {u}"
            s /= 1024.0
        return f"{s:.1f} GB"

    def format_duration(self, seconds: Optional[int]) -> Optional[str]:
        if not seconds:
            return None
        m, s = divmod(int(seconds), 60)
        h, m = divmod(m, 60)
        if h > 0:
            return f"{h:02d}:{m:02d}:{s:02d}"
        return f"{m:02d}:{s:02d}"
