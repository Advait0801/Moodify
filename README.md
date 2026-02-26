# 🎵 Moodify

<div align="center">

**An AI-powered mood-based music recommendation platform with face/text emotion detection and personalized Spotify playlists**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com)
[![ONNX](https://img.shields.io/badge/ONNX-Inference-orange.svg)](https://onnx.ai)
[![Spotify](https://img.shields.io/badge/Spotify-API-1DB954.svg)](https://developer.spotify.com)
[![Swift](https://img.shields.io/badge/Swift-5-SwiftUI-orange.svg)](https://swift.org)

</div>

---

## 📱 Overview

**Moodify** is a full-stack mood-based music recommendation system that uses AI to detect emotional state from a photo or text, then recommends songs and playlists via Spotify. Built with a microservice-oriented backend (Node.js API Gateway, FastAPI mood detection, Node.js recommendation engine), a Next.js web app, and a native **iOS app**, it demonstrates production-ready backend engineering, ML integration, and system design.

### Key Highlights

- 🎭 **Dual Input Modes**: Photo-based face emotion detection (ONNX) or text-based emotion (OpenAI)
- 🎵 **Spotify Integration**: User OAuth (connect/link account); track recommendations via **Search API** (by genre) with preview URLs; fallback to curated playlists if needed
- 🔐 **Secure Auth**: JWT authentication with bcrypt password hashing, optional username and profile picture
- 🐳 **Dockerized Backend**: API Gateway, Mood Detection (Python), Recommendation Engine, Redis, PostgreSQL
- 🎨 **Web & iOS**: Next.js App Router (Tailwind, light/dark, camera/audio) and native iOS app (Swift/SwiftUI) sharing the same APIs
- 📊 **Mood smoothing**: Redis stores recent moods per user for smoothing; profile shows past recommendations (from local storage / recommendations table)
- ☁️ **AWS-Ready**: Deploy backend on EC2 + RDS + CloudFront, frontend on Amplify (HTTPS)

---

## ✨ Features

### Core Functionality

- **Photo Mood Analysis**: Upload or capture a photo → face detection → emotion classification (ONNX) → emotion-to-mood mapping → Spotify recommendations
- **Text Mood Analysis**: Enter how you feel in text → OpenAI text-to-emotion → Spotify recommendations
- **User Accounts**: Register (email, optional username, password), login (email or username), profile with avatar and password change
- **Recommendations**: Tracks from Spotify (Search by genre) or curated fallback; preview URLs; optional AI-generated explanation (OpenAI)
- **YouTube Previews**: Optional YouTube video IDs for tracks (YouTube Data API)

### Backend & Data

- **API Gateway**: REST APIs, JWT auth, orchestration to mood-detection and recommendation-engine, mood smoothing, Redis for async jobs
- **Mood Detection**: FastAPI service; image preprocessing, ONNX inference, confidence scores; no auth/DB/Spotify
- **Recommendation Engine**: Emotion→genre mapping, Spotify **Search API** (tracks by genre; Recommendations endpoint deprecated), OpenAI explanations, curated fallback
- **PostgreSQL**: Users, recommendations, mood_history, user_uploads, spotify_tokens; migrations (001–005) for schema

### User Experience

- **Web (Next.js)**: Dashboard (hero, Analyze Photo/Text), Analyze (camera/file or text), Results (emotion, tracks, play/preview, YouTube modal), Profile (avatar, username, email, password, past recommendations), light/dark theme
- **iOS (Swift/SwiftUI)**: Login, Register, Dashboard, Analyze (camera/photo or text), Results (emotion, tracks, previews), Profile — same backend APIs, native UI

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Web / iOS      │◄───────►│   API Gateway    │◄───────►│   PostgreSQL    │
│  (Clients)      │  REST   │   (Node.js)      │  HTTP   │   (RDS)         │
└─────────────────┘         └──────────────────┘         └─────────────────┘
      │                              │
      │                    ┌─────────┴─────────┐
      │                    │                   │
      ▼                    ▼                   ▼
┌─────────────┐     ┌──────────────┐   ┌───────────────┐
│  Amplify    │     │ Mood Detect  │   │ Recommendation│
│  (HTTPS)    │     │ (FastAPI)    │   │ Engine        │
└─────────────┘     │ ONNX + CV    │   │ (Node.js)     │
                    └──────────────┘   └───────────────┘
                             │                   │
                             │                   ├──────────────┐
                             │                   ▼              ▼
                             │            ┌────────────┐  ┌────────────┐
                             │            │  Spotify   │  │  OpenAI    │
                             │            │  API       │  │  API       │
                             │            └────────────┘  └────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
             ┌──────────────┐   ┌──────────────┐
             │  CloudFront  │   │ Redis        │
             │  (HTTPS)     │   │ (mood cache) │
             └──────────────┘   └──────────────┘
                    │                 │
                    └────────┬────────┘
                             ▼
                    ┌──────────────┐
                    │  EC2         │
                    │  (Backend)   │
                    └──────────────┘
```

### Data Flow

1. **Auth**: User registers/logs in → API Gateway (JWT, bcrypt) → PostgreSQL `users`
2. **Photo Analyze**: Client uploads image → API Gateway (auth) → Mood Detection (ONNX emotion) → API Gateway (smoothing) → Recommendation Engine (Spotify + optional OpenAI) → response with tracks
3. **Text Analyze**: Client sends text → API Gateway (auth) → Recommendation Engine (OpenAI text-to-emotion) → Spotify recommendations → response
4. **Mood smoothing**: API Gateway uses Redis to store recent moods per user (for smoothing); no separate analytics worker in the deployed stack.

---

## 🔄 Workflow (step-by-step)

*What actually happens, and what happens when something fails.*

### 1. User signs up or logs in

- **Register**: Client sends email, password (optional username). API Gateway hashes password with bcrypt, inserts into PostgreSQL `users`. Returns JWT. If email already exists → 409/400.
- **Login**: Client sends email (or username) + password. API Gateway looks up user, compares password with bcrypt. If valid → returns JWT; if not → 401.
- **Failures**: Invalid body → 400. DB down → 500. JWT is used in `Authorization: Bearer <token>` for protected routes.

### 2. User uploads a photo for mood analysis

- **Request**: Web or iOS sends `POST /mood/analyze` with `multipart/form-data` (image file). **Auth required** (JWT).
- **No file**: API returns 400 "No file provided".
- **API Gateway** receives the file, reads it into a buffer, calls the **Mood Detection** service (FastAPI) at `POST /infer/mood` with the image.
- **Mood Detection**:
  - Decodes the image (invalid image → raises, API Gateway returns 500).
  - Resizes if larger than max dimension.
  - **Face detection**: OpenCV Haar cascade. If **no face is found**, it still runs inference using a **center crop** of the image and returns `face_detected: false` (no error).
  - Preprocesses the crop (normalize, model input size), runs **ONNX** inference, returns `predicted_emotion`, `confidence`, `emotion_probabilities`, `face_detected`.
- **If Mood Detection fails** (timeout, crash, 5xx): API Gateway catches the error and rethrows → client gets 500 "Mood detection failed".
- **API Gateway** then:
  - Pushes this mood to **Redis** (per-user list of recent emotion probabilities for **mood smoothing**).
  - Optionally loads recent moods from Redis and **averages** probabilities over a small window (smoothing).
  - Calls **Recommendation Engine** with the (possibly smoothed) emotion and confidence.

### 3. Recommendation Engine (same for photo and text flows)

- **Input**: Emotion, confidence, userId, optional emotion probabilities.
- **Low confidence**: If confidence is below a threshold (e.g. 0.4), the engine **forces neutral** mood and uses neutral recommendations (no error).
- **Emotion mapping**: Maps emotion (e.g. happy, sad, angry) to **genres** (and energy/valence/danceability for blending). Genres are chosen from Spotify's accepted seed set.
- **Spotify path** (primary):
  - Gets an access token via **client_credentials** (server-side; no user Spotify login).
  - Uses Spotify **Search API** (by genre) to fetch tracks, since the **Recommendations API** is deprecated and returns 404 for new/dev apps. Multiple genre searches are merged and deduped to return up to ~20 tracks.
  - If **Spotify fails** (no token, rate limit, API error): catches error and falls back (see below).
  - If Spotify succeeds: returns tracks with `preview_url` (Spotify 30s preview). **No playlist is created on Spotify**; we only return track recommendations. Optionally calls **OpenAI** for a short explanation; if OpenAI fails, explanation is omitted (no error).
- **Fallback path** (when Spotify fails or is not configured):
  - Uses **curated playlists** (hardcoded tracks per emotion). For each track, optionally calls **YouTube Data API** to get a video ID; if no API key or YouTube fails, `youtube_video_id` is just missing (track still returned with a search URL).
  - If **both Spotify and fallback** fail → Recommendation Engine throws → client gets 500.
- **Persistence**: For non-anonymous users, the engine writes the recommendation (user_id, emotion, track IDs) to PostgreSQL `recommendations`. There is **no API** that returns “past recommendations” for the profile; the web/iOS profile “past recommendations” come from **local storage** only.

### 4. User enters text for mood analysis

- **Request**: `POST /mood/analyze/text` with `{ "text": "..." }`. **No auth required**; if no user, `userId` is `"anonymous"`.
- **Recommendation Engine** calls **OpenAI** (text-to-emotion) to get an emotion and confidence. If that fails → client gets 500 "Text mood analysis failed".
- Same recommendation flow as above (Spotify → fallback, DB save for logged-in users).

### 5. What is *not* wired end-to-end

- **Mood history table**: The `mood_history` table exists in the schema but is not populated; API Gateway only uses Redis for mood smoothing (in-memory per request). No analytics worker is deployed.
- **Spotify playlist creation**: We only **recommend** tracks (via Search or fallback). We do not create a playlist on the user's Spotify account (that would require user OAuth).
- **Profile “past recommendations”**: Stored in DB by the Recommendation Engine, but the API does not expose “my past recommendations”; the profile screen uses **local storage** only.

---

## 🛠️ Tech Stack

### Frontend

- **Web**: Next.js 16 (App Router), TypeScript 5, React 19, Tailwind CSS 4, next-themes (light/dark). Auth via React Context; Fetch to API Gateway (`NEXT_PUBLIC_API_URL`).
- **iOS**: Swift, SwiftUI. Views: Login, Register, Dashboard, Analyze, Results, Profile. `APIClient` + `AuthStorage`; same API Gateway base URL.

### Backend (Node.js)

- **API Gateway**: Fastify 5, JWT (jsonwebtoken), bcrypt, pg, ioredis, Zod, @fastify/cors, @fastify/multipart
- **Recommendation Engine**: Fastify 5, pg, OpenAI SDK, Axios (Spotify/YouTube)
- **Runtime**: Node 20, TypeScript 5

### Mood Detection (Python)

- **Framework**: FastAPI 0.104, Uvicorn
- **ML**: ONNX Runtime, OpenCV, NumPy, Pillow
- **Model**: MobileNetV2-based emotion classifier (ONNX)

### Data & Infra

- **Database**: PostgreSQL 15 (users, recommendations, mood_history, user_uploads, spotify_tokens); migrations in `backend/migrations/` (001–005)
- **Cache/Queue**: Redis 7
- **Container**: Docker, Docker Compose (`backend/docker-compose.yml`, `backend/docker-compose.aws.yml`)
- **Deploy**: AWS Amplify (web), EC2 + CloudFront (API), RDS (PostgreSQL)

---

### AWS Deployment (Summary)

Moodify is deployed on **EC2** (backend), **RDS** (PostgreSQL), **CloudFront** (HTTPS API), and **AWS Amplify** (web app). Redis runs in Docker on EC2. No local PostgreSQL required—migrations run via Docker against RDS.

**High-level order:**

1. **Spotify Developer Dashboard** – Create an app, get Client ID/Secret, add Redirect URI(s): production = `https://<your-cloudfront-domain>/auth/spotify/callback`, optional dev = `http://localhost:3000/auth/spotify/callback`.
2. **RDS (PostgreSQL 15)** – Create instance (same region as EC2), Public access = Yes if you run migrations from your machine; security group allows 5432 from My IP (and later from EC2 security group). Initial database name: `moodify`. Build `DATABASE_URL` with `?sslmode=require`.
3. **Redis** – Use Redis in Docker on EC2 (no ElastiCache); `docker-compose.aws.yml` includes the Redis service.
4. **Migrations** – From project root, export `DATABASE_URL`, then run all migrations with a one-off Postgres container (see [Running migrations](#running-migrations) below).
5. **EC2** – Amazon Linux or Ubuntu; install Docker + Docker Compose (standalone). Security group: SSH (22) from My IP, Custom TCP 3002 from 0.0.0.0/0. Add EC2 security group to RDS inbound (5432). Clone repo, create `backend/.env` with all production env vars, build images with `docker build` (per service), then `docker-compose -f docker-compose.aws.yml --env-file .env up -d --no-build`.
6. **CloudFront** – Create distribution; origin = EC2 (public DNS or IP). Origin port 3002 if supported, or expose API on port 80 on EC2. Viewer protocol = Redirect HTTP to HTTPS; cache policy = CachingDisabled. Use the CloudFront URL as the public API base.
7. **Amplify** – Connect repo, set Root = `web`. Env: `NEXT_PUBLIC_API_URL` = CloudFront URL, `NEXT_PUBLIC_YOUTUBE_API_KEY` if needed. Set backend `FRONTEND_SUCCESS_URL` to Amplify app URL and `SPOTIFY_REDIRECT_URI` to CloudFront callback URL; restart api-gateway.

**Backend env (`backend/.env` on EC2):**

- **API Gateway & Recommendation Engine (shared):** `DATABASE_URL`, `JWT_SECRET`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI` (backend callback, e.g. `https://<cloudfront>/auth/spotify/callback`), `FRONTEND_SUCCESS_URL` (Amplify URL). Optional: `OPENAI_API_KEY`, `YOUTUBE_API_KEY`, `CONFIDENCE_THRESHOLD`, `MOOD_SMOOTHING_WINDOW_SIZE`.

`docker-compose.aws.yml` passes these into both api-gateway and recommendation-engine; no separate `.env` per service needed on EC2.

**Running migrations (no local PostgreSQL):**

```bash
cd /path/to/Moodify
export DATABASE_URL="postgresql://moodify:PASSWORD@RDS_ENDPOINT:5432/moodify?sslmode=require"
docker run --rm -v "$(pwd)/backend/migrations:/migrations" -e DATABASE_URL postgres:15-alpine \
  sh -c 'psql "$DATABASE_URL" -f /migrations/001_initial_schema.sql && \
         psql "$DATABASE_URL" -f /migrations/002_add_username.sql && \
         psql "$DATABASE_URL" -f /migrations/003_profile_picture.sql && \
         psql "$DATABASE_URL" -f /migrations/004_user_uploads.sql && \
         psql "$DATABASE_URL" -f /migrations/005_spotify_oauth.sql'
```

**EC2 build & run (if Docker Compose build fails due to Buildx version):**

```bash
cd ~/Moodify/backend
docker build -t moodify-mood-detection:latest ./services/mood-detection
docker build -t moodify-api-gateway:latest ./services/api-gateway
docker build -t moodify-recommendation-engine:latest ./services/recommendation-engine
docker-compose -f docker-compose.aws.yml --env-file .env up -d --no-build
```

**Updates:** Push code → EC2 `git pull`, rebuild only changed images (`docker build -t ... ./services/<name>`), then `docker-compose -f docker-compose.aws.yml --env-file .env up -d --no-build`.

---

## 🚧 Future Enhancements

- [ ] Android app (Kotlin/Compose) reusing same backend
- [ ] Custom playlists per user stored in DB
- [ ] More emotion labels and mood mappings
- [ ] A/B testing for recommendation strategies
- [ ] Rate limiting and WAF on CloudFront
- [ ] Monitoring (CloudWatch, health dashboards)
- [ ] Path-based Amplify builds (only build when `web/` changes)

---

## 🙏 Acknowledgments

- **Spotify** for the Web API (Search and client credentials; Recommendations endpoint is deprecated for new apps)
- **OpenAI** for text-to-emotion and explanations
- **ONNX** and the open-source emotion model used for face-based mood detection

---

<div align="center">

**Built with ❤️ using TypeScript, Python, Next.js, SwiftUI, FastAPI, and Spotify**

⭐ Star this repo if you find it helpful!

</div>
