# 🎵 Moodify

<div align="center">

**A mood-based music recommendation platform with AI emotion detection and personalized playlists**

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](https://www.typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000.svg)](https://fastify.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com)
[![Spotify](https://img.shields.io/badge/Spotify-API-1DB954.svg)](https://developer.spotify.com)
[![ONNX](https://img.shields.io/badge/ONNX-Runtime-005CED.svg)](https://onnx.ai)

</div>

---

## 📱 Overview

**Moodify** is a full-stack mood-based music recommendation system that uses AI to detect emotion from photos or text and suggests personalized tracks and playlists. Built with a microservice-oriented backend (Node.js API Gateway, FastAPI ML service, Recommendation Engine, Analytics Worker) and a modern Next.js web app, it demonstrates production-ready backend engineering, ML integration, and clean system design.

### Key Highlights

- 🎭 **AI Mood Detection**: Face-based emotion classification via ONNX model or text-to-emotion via LLM
- 🎧 **Personalized Recommendations**: Spotify integration with fallback to YouTube when previews are unavailable
- 🔐 **Secure Authentication**: JWT auth with username/email login, profile picture, and password change
- 🐳 **Microservice Architecture**: API Gateway, Mood Detection (FastAPI), Recommendation Engine, Analytics Worker
- 🎨 **Modern Web UI**: Next.js App Router, Tailwind CSS, light/dark theme, responsive layout
- 📊 **Mood History**: Async analytics worker tracks mood history; profile shows past recommendations
- 🎬 **Centered YouTube Player**: In-app YouTube playback in a centered overlay (no bottom bar)
- 📱 **Photo or Text Input**: Upload/capture a photo or describe your mood in words

---

## ✨ Features

### Core Functionality

- **Mood Analysis**: Upload a photo (camera or file) or type how you feel; get emotion + confidence
- **Music Recommendations**: Tracks from Spotify with preview playback; YouTube fallback with centered video player
- **User Accounts**: Register with email + username; login with email or username; JWT sessions
- **Profile**: Avatar (add/update/remove), username, email, change password, past recommendations list
- **Dashboard**: Welcome hero, quick actions (Photo mood / Text mood), recent activity from mood history

### Backend Services

- **API Gateway (Node.js/Fastify)**: Auth, user management, orchestration; calls Mood Detection and Recommendation Engine
- **Mood Detection (FastAPI)**: Image preprocessing, face detection, ONNX emotion inference; text-to-emotion via OpenAI
- **Recommendation Engine (Node.js)**: Emotion → music mapping, Spotify API, YouTube fallback, explanation generation
- **Analytics Worker (Node.js)**: Redis-backed mood history jobs, PostgreSQL persistence

### User Experience

- **Responsive Layout**: Full-width content (max-w-6xl), grid track list, centered YouTube modal
- **Theme Support**: Light/dark mode with CSS variables
- **Past Recommendations**: Stored in localStorage; shown on dashboard and profile
- **Graceful Errors**: Validation, toasts, and clear error messages

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Next.js Web   │◄───────►│   API Gateway    │◄───────►│   PostgreSQL    │
│   (React 19)    │  REST   │   (Fastify)      │  pg     │   (Database)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
      │                              │
      │                              ├──────────────────┐
      │                              │                  │
      ▼                              ▼                  ▼
┌─────────────┐              ┌──────────────┐  ┌──────────────┐
│  JWT /      │              │ Mood         │  │ Recommendation│
│  localStorage│             │ Detection    │  │ Engine       │
└─────────────┘              │ (FastAPI)    │  │ (Node.js)    │
                             │ ONNX + face  │  │ Spotify +    │
                             │ text→emotion │  │ YouTube      │
                             └──────────────┘  └──────────────┘
                                    │                  │
                                    │                  │
                             ┌──────┴──────────────────┴──────┐
                             │                                 │
                             ▼                                 ▼
                      ┌──────────────┐                 ┌──────────────┐
                      │ Analytics    │                 │ Redis        │
                      │ Worker       │◄────────────────►│ (jobs/cache) │
                      │ (Node.js)    │                  └──────────────┘
                      └──────────────┘
```

### Data Flow

1. **Analyze**: User submits photo or text on the web app → API Gateway receives request (JWT validated).
2. **Mood**: Gateway calls Mood Detection service (image or text endpoint) → emotion + confidence returned.
3. **Recommend**: Gateway calls Recommendation Engine with emotion → Spotify/YouTube tracks + explanation.
4. **Store**: Gateway enqueues mood to Redis; Analytics Worker consumes and writes mood history to PostgreSQL.
5. **Results**: Web app shows emotion, explanation, and track list; user can play previews or open YouTube in a centered overlay.

---

## 🛠️ Tech Stack

### Frontend (Web)

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **State**: React Context (auth), localStorage (session/history)
- **Auth**: JWT in localStorage, protected routes
- **Theme**: next-themes, CSS variables (light/dark)
- **Feedback**: Sonner toasts

### Backend (Node.js)

- **API Gateway**: Fastify 5, JWT (jsonwebtoken), bcrypt, pg, ioredis, axios
- **Recommendation Engine**: Fastify 5, Spotify API, YouTube API, OpenAI (text-emotion)
- **Analytics Worker**: Node.js, ioredis, pg
- **Language**: TypeScript throughout

### ML Service (Python)

- **Framework**: FastAPI 0.104, Uvicorn
- **Inference**: ONNX Runtime, OpenCV, NumPy, Pillow
- **Models**: Emotion classification (e.g. MobileNetV2-based ONNX)

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 Alpine
- **Cache/Queue**: Redis 7 Alpine
- **Migrations**: SQL files in `backend/migrations/` (001 schema, 002 username, 003 profile_picture)

---

## 🚧 Future Enhancements

- [ ] Mobile app (Flutter / React Native)
- [ ] Spotify OAuth for full playback (no 30s preview limit)
- [ ] Playlist creation and saving
- [ ] Server-side mood history API (replace localStorage for past recommendations)
- [ ] More emotion labels and model fine-tuning
- [ ] Rate limiting and API versioning
- [ ] Deploy to AWS / Render

---

## 🙏 Acknowledgments

- **Spotify** for the Web API and embed support
- **YouTube** for embed and Data API
- **ONNX** for portable ML inference
- **Fastify** and **FastAPI** for performant backends

---

<div align="center">

**Built with ❤️ using Next.js, Node.js, FastAPI, and ML**

⭐ Star this repo if you find it helpful!

</div>
