import os
import glob
import time
import asyncio
from app.core.config import settings
from app.core.logging import logger

class CleanupService:
    @staticmethod
    def cleanup_expired_files():
        """Scans downloads and temp storage and deletes files older than FILE_EXPIRATION_MINUTES."""
        now = time.time()
        max_age_seconds = settings.FILE_EXPIRATION_MINUTES * 60
        cleaned_count = 0
        cleaned_bytes = 0
        
        for directory in [settings.DOWNLOAD_DIR, settings.TEMP_DIR]:
            if not os.path.exists(directory):
                continue
            for entry in os.scandir(directory):
                if entry.is_file():
                    try:
                        file_age = now - entry.stat().st_mtime
                        if file_age > max_age_seconds:
                            file_size = entry.stat().st_size
                            os.remove(entry.path)
                            cleaned_count += 1
                            cleaned_bytes += file_size
                    except Exception as e:
                        logger.error(f"Error removing expired file {entry.path}: {e}")
                        
        if cleaned_count > 0:
            logger.info(f"CleanupService: Removed {cleaned_count} expired files ({cleaned_bytes / (1024*1024):.2f} MB).")

    @classmethod
    async def start_periodic_cleanup(cls, interval_seconds: int = 600):
        """Background coroutine that runs periodically to prevent unbounded disk usage."""
        while True:
            try:
                cls.cleanup_expired_files()
            except Exception as e:
                logger.error(f"Periodic cleanup failure: {e}")
            await asyncio.sleep(interval_seconds)
