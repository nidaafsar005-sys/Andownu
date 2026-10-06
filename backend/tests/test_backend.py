import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import validate_and_normalize_url, sanitize_filename
from app.providers.registry import detect_provider
from fastapi import HTTPException

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Andown Universal Video Downloader Engine"

def test_providers_endpoint():
    response = client.get("/api/providers")
    assert response.status_code == 200
    providers = response.json()
    assert len(providers) >= 8
    names = [p["name"] for p in providers]
    assert "YouTube" in names
    assert "Instagram" in names
    assert "TikTok" in names

def test_url_normalization_and_ssrf():
    # SSRF Localhost protection
    with pytest.raises(HTTPException) as exc:
        validate_and_normalize_url("http://localhost:8000/secret")
    assert exc.value.status_code == 400

    # SSRF IP protection
    with pytest.raises(HTTPException) as exc:
        validate_and_normalize_url("http://127.0.0.1/malicious")
    assert exc.value.status_code == 400

    with pytest.raises(HTTPException) as exc:
        validate_and_normalize_url("http://192.168.1.1/router")
    assert exc.value.status_code == 400

    # Valid YouTube URL
    url, domain = validate_and_normalize_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert domain == "youtube.com"
    assert "youtube.com" in url

def test_provider_detection():
    yt_prov = detect_provider("https://youtu.be/dQw4w9WgXcQ")
    assert yt_prov.id == "youtube"

    ig_prov = detect_provider("https://www.instagram.com/reel/Cx12345/")
    assert ig_prov.id == "instagram"

    tt_prov = detect_provider("https://www.tiktok.com/@user/video/123456789")
    assert tt_prov.id == "tiktok"

    reddit_prov = detect_provider("https://www.reddit.com/r/videos/comments/xyz123")
    assert reddit_prov.id == "reddit"

    pin_prov = detect_provider("https://pin.it/7abcxyz")
    assert pin_prov.id == "pinterest"

def test_filename_sanitization():
    unsafe = 'Video / With \\ Dangerous : Chars * ? " < > | 2026'
    safe = sanitize_filename(unsafe)
    assert "/" not in safe
    assert "\\" not in safe
    assert ":" not in safe
    assert "*" not in safe
    assert "?" not in safe
    assert '"' not in safe
    assert "<" not in safe
    assert ">" not in safe
    assert "|" not in safe
