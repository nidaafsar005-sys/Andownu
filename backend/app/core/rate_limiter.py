import time
from typing import Dict
from fastapi import Request, HTTPException
from app.core.config import settings

# In-memory IP-based rate limiting dictionary: {ip: [timestamps]}
ip_requests: Dict[str, list] = {}

def rate_limit_check(request: Request):
    """Enforces rate limiting per IP address using a sliding 60-second window."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window = 60.0
    
    # Clean old timestamps
    if client_ip in ip_requests:
        ip_requests[client_ip] = [t for t in ip_requests[client_ip] if now - t < window]
    else:
        ip_requests[client_ip] = []
        
    if len(ip_requests[client_ip]) >= settings.RATE_LIMIT_ANONYMOUS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a minute and try again."
        )
        
    ip_requests[client_ip].append(now)
