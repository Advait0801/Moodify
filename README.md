# 🎵 Moodify

<div align="center">

**An AI-powered mood-based music recommendation platform with face/text emotion detection and personalized Spotify playlists**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org)
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
- 🎵 **Spotify Integration**: Client credentials; track recommendations via **Search API** (by genre) with preview URLs; fallback to curated playlists if needed
- 🔐 **Secure Auth**: JWT authentication with bcrypt password hashing, optional username and profile picture
- 🐳 **Dockerized Backend**: API Gateway, Mood Detection (Python), Recommendation Engine, Analytics Worker, Redis, PostgreSQL
- 🎨 **Web & iOS**: Next.js App Router (Tailwind, light/dark, camera/audio) and native iOS app (Swift/SwiftUI) sharing the same APIs
- 📊 **Mood History**: Async analytics worker persists mood history; profile shows past recommendations
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
- **Analytics Worker**: Consumes Redis queue, writes mood history to PostgreSQL (eventually consistent)
- **PostgreSQL**: Users, recommendations, mood_history, user_uploads; migrations (001–004) for schema

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
             │  (HTTPS)     │   │ (Queue/Cache)│
             └──────────────┘   └──────────────┘
                    │                 │
                    ▼                 ▼
             ┌──────────────┐   ┌──────────────┐
             │  EC2         │   │ Analytics    │
             │  (Backend)   │   │ Worker       │
             └──────────────┘   └──────────────┘
```

### Data Flow

1. **Auth**: User registers/logs in → API Gateway (JWT, bcrypt) → PostgreSQL `users`
2. **Photo Analyze**: Client uploads image → API Gateway (auth) → Mood Detection (ONNX emotion) → API Gateway (smoothing) → Recommendation Engine (Spotify + optional OpenAI) → response with tracks
3. **Text Analyze**: Client sends text → API Gateway (auth) → Recommendation Engine (OpenAI text-to-emotion) → Spotify recommendations → response
4. **Analytics**: Mood smoothing uses Redis (recent moods per user). A separate Analytics Worker exists that would consume a queue and write to `mood_history`; see [Implementation notes](#-implementation-notes--readme-vs-code) below.

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

- **Mood history for analytics**: The **Analytics Worker** is built to consume a Redis queue and insert into `mood_history`. The **API Gateway never pushes jobs to that queue**; it only uses Redis for mood smoothing. So `mood_history` is not populated by the current flow.
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
- **Analytics Worker**: ioredis, pg, background worker loop
- **Runtime**: Node 20, TypeScript 5

### Mood Detection (Python)

- **Framework**: FastAPI 0.104, Uvicorn
- **ML**: ONNX Runtime, OpenCV, NumPy, Pillow
- **Model**: MobileNetV2-based emotion classifier (ONNX)

### Data & Infra

- **Database**: PostgreSQL 16 (users, recommendations, mood_history); migrations in `backend/migrations/`
- **Cache/Queue**: Redis 7
- **Container**: Docker, Docker Compose (`backend/docker-compose.yml`, `backend/docker-compose.aws.yml`)
- **Deploy**: AWS Amplify (web), EC2 + CloudFront (API), RDS (PostgreSQL)

---

### AWS Deployment (Summary)

- **Backend**: EC2 + RDS (PostgreSQL) + Redis on EC2; `docker-compose.aws.yml`; CloudFront in front of EC2 (origin = EC2 public DNS, port 3002, HTTPS); RDS SSL handled in Node.
- **Frontend**: Amplify, branch connected to repo, build from `web`; env `NEXT_PUBLIC_API_URL` = CloudFront URL (e.g. `https://d14rr2aqdwi0dp.cloudfront.net`).
- **Env (backend)**:
  - **API Gateway / Compose**: `backend/.env` (or export) with `DATABASE_URL`, `JWT_SECRET`.
  - **Recommendation Engine**: `backend/services/recommendation-engine/.env` with `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI` (e.g. Amplify app URL `/auth/callback`). Optional: `OPENAI_API_KEY`, `YOUTUBE_API_KEY`.
- **Spotify**: Create an app in [Spotify Developer Dashboard](https://developer.spotify.com/dashboard); add a Redirect URI (e.g. your Amplify URL). Backend uses **client credentials** and **Search API** (by genre), not the deprecated Recommendations API.
- **Migrations**: Run `001_initial_schema.sql` through `004_user_uploads.sql` against RDS (e.g. via Docker: `postgres:15-alpine` or `postgres:16-alpine` with `psql` and connection URI including `?sslmode=require`).
- **Updates**: Push code → EC2 `git pull`, rebuild images (`docker build --no-cache` per service), `docker-compose -f docker-compose.aws.yml up -d`

---

## 🚧 Future Enhancements

- [ ] Spotify OAuth login (use Spotify identity)
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
