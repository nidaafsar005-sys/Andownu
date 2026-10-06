import re
import ipaddress
from urllib.parse import urlparse
from typing import Optional, Tuple
from fastapi import HTTPException

# Disallowed protocols
ALLOWED_SCHEMES = {"http", "https"}

# Disallowed internal/private IP blocks and localhost
DISALLOWED_HOSTS = {
    "localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal", "169.254.169.254"
}

# Supported Platform Domain List
SUPPORTED_DOMAINS = {
    "youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com",
    "facebook.com", "m.facebook.com", "fb.watch", "web.facebook.com",
    "instagram.com", "instagr.am",
    "tiktok.com", "vm.tiktok.com", "m.tiktok.com",
    "twitter.com", "x.com", "mobile.twitter.com",
    "reddit.com", "v.redd.it", "old.reddit.com",
    "pinterest.com", "pin.it", "in.pinterest.com",
    "vimeo.com", "player.vimeo.com",
    "dailymotion.com", "dai.ly",
    "twitch.tv", "clips.twitch.tv",
    "linkedin.com",
    "snapchat.com"
}

def sanitize_filename(filename: str, max_len: int = 150) -> str:
    """Sanitize filename to prevent directory traversal and remove illegal characters."""
    clean = re.sub(r'[\\/*?:"<>|]', "", filename)
    clean = re.sub(r'[\s]+', " ", clean).strip()
    clean = clean.encode('ascii', 'ignore').decode('ascii')
    if not clean:
        clean = "andown_video"
    if len(clean) > max_len:
        clean = clean[:max_len]
    return clean

def validate_and_normalize_url(raw_url: str) -> Tuple[str, str]:
    """
    Validates URL against SSRF attacks and normalizes it.
    Returns: (normalized_url, domain)
    Raises HTTPException if invalid or unsafe.
    """
    if not raw_url or not isinstance(raw_url, str):
        raise HTTPException(status_code=400, detail="Please enter a valid video URL.")
        
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
        
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL format.")
        
    if parsed.scheme.lower() not in ALLOWED_SCHEMES:
        raise HTTPException(status_code=400, detail="Only HTTP and HTTPS protocols are supported.")
        
    hostname = (parsed.hostname or "").lower()
    if not hostname:
        raise HTTPException(status_code=400, detail="Invalid host in URL.")
        
    # Check SSRF / Local IP / Reserved ranges
    if hostname in DISALLOWED_HOSTS:
        raise HTTPException(status_code=400, detail="Access to local or private networks is strictly prohibited.")
        
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            raise HTTPException(status_code=400, detail="Access to private IP addresses is forbidden.")
    except ValueError:
        pass # hostname is a domain name, which is normal
        
    # Check domain against approved or supported domains
    matched_domain = None
    for sup in SUPPORTED_DOMAINS:
        if hostname == sup or hostname.endswith("." + sup):
            matched_domain = sup
            break
            
    if not matched_domain:
        # Check if generic domain format is at least valid
        if not re.match(r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', hostname):
            raise HTTPException(status_code=400, detail="Invalid domain name.")
        matched_domain = hostname

    # Remove tracking fragments / garbage
    clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    if parsed.query:
        # keep standard video query params e.g. v=, query etc.
        clean_url += f"?{parsed.query}"
        
    return clean_url, matched_domain
