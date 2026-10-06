# Andown — Universal Video Downloader Web Application

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](https://docker.com)

**Andown** ([https://www.andown.in/](https://www.andown.in/)) is a production-grade, modular, high-speed Universal Video Downloader SaaS application. It allows users to analyze public URLs from popular platforms (YouTube, Facebook, Instagram, TikTok, X/Twitter, Reddit, Pinterest, Vimeo, Dailymotion, Twitch, etc.) and download available video resolutions and audio streams with zero deceptive popups or fake progress bars.

---

## 🌟 Key Features

1. **Modular Provider Architecture (`app/providers/`):**
   - Object-oriented platform isolation (`youtube.py`, `instagram.py`, `tiktok.py`, etc.).
   - Common interface: `detect(url)`, `get_info(url)`, format normalization, and error handling.
   - Hot-toggleable provider switches in Admin Panel without code changes or restarts.

2. **Security & Anti-Abuse Hardening:**
   - **Strict SSRF Defense:** Rejects `localhost`, private IP ranges (`10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.0/8`, etc.), and metadata IPs.
   - **Rate Limiting:** Sliding-window rate limiter per client IP address.
   - **Filename Sanitization:** Strips illegal path characters (`/ \ : * ? " < > |`) preventing directory traversal attacks.
   - **Zero Bypass Policy:** Strictly does NOT bypass logins, paywalls, DRM, or private accounts.

3. **Honest Streaming & Async Job System:**
   - Asynchronous job queue (`queued` -> `processing` -> `completed` -> `failed` -> `cancelled`).
   - Honest progress tracking hooked directly to `yt-dlp` stream events.
   - Container-level multi-stream and audio extraction capabilities.

4. **Automated Ephemeral Storage Lifecycle:**
   - Background cleanup engine running every 10 minutes.
   - Automatically purges completed temporary download files older than 45 minutes to protect disk space.

5. **Premium SaaS UI/UX:**
   - Built with React 19, TypeScript, Tailwind CSS v4, and Lucide icons.
   - Dark/Light mode support with persistence in `localStorage`.
   - Real-time link validation and platform detection.
   - Responsive mobile-first layout with clean format cards.
   - Local browser history for recent downloads without requiring registration.

6. **SEO-First Architecture:**
   - Semantic HTML5 with complete Open Graph, Twitter Cards, and canonical URLs for `https://www.andown.in/`.
   - Structured JSON-LD microdata (`WebApplication`, `Organization`, `WebSite`).
   - Pre-configured `sitemap.xml` and `robots.txt`.
   - In-depth platform landing sections, workflow steps, and 10+ comprehensive FAQs.

7. **Admin Dashboard (`/admin`):**
   - Telemetry metrics: Ingestion requests, successful downloads, transferred bandwidth, storage metrics.
   - Platform toggle controls (turn any platform extractor online/offline in real-time).
   - Recent jobs monitor with live status badges.

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── admin.py           # Admin authentication & metric APIs
│   │   │       ├── health.py          # Health check & provider list
│   │   │       └── media.py           # /info, /process, /status, /download, /cancel
│   │   ├── core/
│   │   │   ├── config.py              # Application settings (Pydantic)
│   │   │   ├── logging.py             # Structured JSON logger
│   │   │   ├── rate_limiter.py        # Sliding-window IP rate limiter
│   │   │   └── security.py            # SSRF protection, URL validation & sanitization
│   │   ├── models/
│   │   │   └── media.py               # Pydantic schemas for Media, Formats, and Jobs
│   │   ├── providers/
│   │   │   ├── base.py                # Abstract Base Provider interface
│   │   │   ├── generic.py             # Modular yt-dlp provider implementation
│   │   │   └── registry.py            # Provider registry & runtime toggle manager
│   │   ├── services/
│   │   │   ├── cleanup_service.py     # Background auto-cleanup worker (45 min TTL)
│   │   │   └── download_service.py    # Async download task execution & progress tracking
│   │   └── main.py                    # FastAPI entrypoint, middleware, lifespan
│   ├── storage/
│   │   ├── downloads/                 # Temporary processed files
│   │   └── temp/                      # Intermediate stream chunks
│   ├── tests/
│   │   └── test_backend.py            # Pytest test suite (SSRF, URL, providers, health)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   ├── robots.txt                 # Search engine crawler instructions
│   │   └── sitemap.xml                # Canonical XML sitemap
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx     # Admin panel with metrics & provider switches
│   │   │   ├── AnalysisResultCard.tsx # Media preview, author, duration & format selector
│   │   │   ├── DownloadProgressCard.tsx# Honest progress monitor & file save button
│   │   │   ├── Footer.tsx             # Legal policies, copyright & disclaimer
│   │   │   ├── Navbar.tsx             # Responsive header, theme switch & mobile drawer
│   │   │   ├── SeoSections.tsx        # Workflow, platform grid, features & 10 FAQs
│   │   │   └── SmartUrlInput.tsx      # Real-time platform detection & paste button
│   │   ├── api.ts                     # REST client connector
│   │   ├── App.tsx                    # Main container application
│   │   ├── index.css                  # Tailwind styles & glassmorphism utilities
│   │   ├── main.tsx                   # React root
│   │   └── types.ts                   # TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml                 # Multi-container orchestration
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- FFmpeg (optional on host, pre-installed in Docker)

### 1. Run the Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧪 Testing

Run backend security, validation, and SSRF unit tests:
```bash
cd backend
pytest tests
```

Build and test frontend TypeScript compilation:
```bash
cd frontend
npm run build
```

---

## 🐳 Production Deployment (Docker)

Deploy both services with a single command:
```bash
docker-compose up -d --build
```
This starts:
- `andown-backend`: Python 3.12 with FFmpeg and automatic cleanup worker on port `8000`.
- `andown-frontend`: Nginx serving static production bundles with security headers and reverse-proxying `/api/` on port `80`.

---

## 🔐 Admin Panel Credentials
- URL: Navigate to **Admin Panel** in the top navigation bar.
- Email: `admin@andown.in`
- Default Password: `admin123` *(Configurable via environment variables)*

---

## ⚖️ Legal & Compliance
Andown is designed strictly for public, non-copyright-infringing, and personal offline archiving. It complies with DMCA procedures and includes explicit disclaimers stating that the service is not affiliated with any third-party social media platform.
