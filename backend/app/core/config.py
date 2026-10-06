import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Andown"
    TAGLINE: str = "Download Videos From Your Favorite Platforms"
    CANONICAL_DOMAIN: str = "https://www.andown.in"
    API_V1_STR: str = "/api"
    
    # Environment
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    
    # Security
    JWT_SECRET: str = "andown_super_secret_jwt_key_change_in_production_998811"
    ADMIN_EMAIL: str = "admin@andown.in"
    ADMIN_PASSWORD_HASH: str = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW" # default: admin123
    
    # Storage
    STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage"))
    DOWNLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage", "downloads"))
    TEMP_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage", "temp"))
    
    # Retention & Limits
    FILE_EXPIRATION_MINUTES: int = 45
    MAX_DOWNLOAD_SIZE_MB: int = 500
    DOWNLOAD_TIMEOUT_SECONDS: int = 300
    
    # Rate Limiting
    RATE_LIMIT_ANONYMOUS: int = 25  # per minute
    RATE_LIMIT_BURST: int = 10
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "https://www.andown.in",
        "https://andown.in",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # Analytics & SEO
    GA_MEASUREMENT_ID: str = ""
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(settings.DOWNLOAD_DIR, exist_ok=True)
os.makedirs(settings.TEMP_DIR, exist_ok=True)
