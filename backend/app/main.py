import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import logger
from app.api.routes import media, health, admin
from app.services.cleanup_service import CleanupService

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Andown Universal Video Downloader Backend Engine...")
    # Start background cleanup task
    cleanup_task = asyncio.create_task(CleanupService.start_periodic_cleanup(interval_seconds=600))
    yield
    cleanup_task.cancel()
    logger.info("Shutting down Andown Backend Engine.")

app = FastAPI(
    title="Andown API",
    description="Universal Video Downloader Backend Engine - High performance, asynchronous media processing.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock down to settings.CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Mount API Routers under /api
app.include_router(media.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "online",
        "docs": "/docs",
        "canonical": settings.CANONICAL_DOMAIN
    }
