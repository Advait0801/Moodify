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

</div>

---

## 📱 Overview

**Moodify** is a full-stack mood-based music recommendation system that uses AI to detect emotional state from a photo or text, then recommends songs and playlists via Spotify. Built with a microservice-oriented backend (Node.js API Gateway, FastAPI mood detection, Node.js recommendation engine) and a Next.js web app, it demonstrates production-ready backend engineering, ML integration, and system design.

### Key Highlights

- 🎭 **Dual Input Modes**: Photo-based face emotion detection (ONNX) or text-based emotion (OpenAI)
- 🎵 **Spotify Integration**: OAuth 2.0, playlist creation, track recommendations with preview URLs
- 🔐 **Secure Auth**: JWT authentication with bcrypt password hashing, optional username and profile picture
- 🐳 **Dockerized Backend**: API Gateway, Mood Detection (Python), Recommendation Engine, Analytics Worker, Redis, PostgreSQL
- 🎨 **Modern Web UI**: Next.js App Router, Tailwind CSS, light/dark theme, camera capture and audio player
- 📊 **Mood History**: Async analytics worker persists mood history; profile shows past recommendations
- ☁️ **AWS-Ready**: Deploy backend on EC2 + RDS + CloudFront, frontend on Amplify (HTTPS)

---

## ✨ Features

### Core Functionality

- **Photo Mood Analysis**: Upload or capture a photo → face detection → emotion classification (ONNX) → emotion-to-mood mapping → Spotify recommendations
- **Text Mood Analysis**: Enter how you feel in text → OpenAI text-to-emotion → Spotify recommendations
- **User Accounts**: Register (email, optional username, password), login (email or username), profile with avatar and password change
- **Recommendations**: Tracks with preview URLs, optional Spotify playlist, optional AI-generated explanation (OpenAI)
- **YouTube Previews**: Optional YouTube video IDs for tracks (YouTube Data API)

### Backend & Data

- **API Gateway**: REST APIs, JWT auth, orchestration to mood-detection and recommendation-engine, mood smoothing, Redis for async jobs
- **Mood Detection**: FastAPI service; image preprocessing, ONNX inference, confidence scores; no auth/DB/Spotify
- **Recommendation Engine**: Emotion→mood mapping, Spotify API (search, create playlist), OpenAI explanations, fallback logic
- **Analytics Worker**: Consumes Redis queue, writes mood history to PostgreSQL (eventually consistent)
- **PostgreSQL**: Users, recommendations, mood_history; migrations (001–003) for schema

### User Experience

- **Dashboard**: Hero, quick actions (Analyze Photo, Analyze Text), recent activity
- **Analyze**: Camera/file upload or text input, loading states, redirect to results
- **Results**: Emotion, confidence, track list with play/preview and YouTube modal
- **Profile**: Avatar (initials or profile picture), username, email, password change, past recommendations (local storage + API)
- **Theme**: Light/dark toggle, responsive layout

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Next.js Web   │◄───────►│   API Gateway    │◄───────►│   PostgreSQL    │
│   (Frontend)    │  REST   │   (Node.js)      │  HTTP   │   (RDS)         │
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
4. **Analytics**: API Gateway enqueues mood job to Redis → Analytics Worker consumes → writes to PostgreSQL `mood_history`

---

## 🛠️ Tech Stack

### Frontend (Web)

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4, next-themes (light/dark)
- **State**: React Context (auth), local storage (mood history)
- **Networking**: Fetch to API Gateway (env: `NEXT_PUBLIC_API_URL`)

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

- **Backend**: EC2 + RDS (PostgreSQL) + Redis on EC2; `docker-compose.aws.yml`; CloudFront in front of EC2:3002 (HTTPS); RDS SSL handled in Node (see `notes`)
- **Frontend**: Amplify, branch connected to repo, root `web`, env `NEXT_PUBLIC_API_URL` = CloudFront URL
- **Updates**: Push code → EC2 `git pull`, rebuild images (`docker build --no-cache`), `docker-compose -f docker-compose.aws.yml up -d`

---

## 🚧 Future Enhancements

- [ ] Spotify OAuth login (use Spotify identity)
- [ ] Mobile app (Flutter / React Native) reusing same backend
- [ ] Custom playlists per user stored in DB
- [ ] More emotion labels and mood mappings
- [ ] A/B testing for recommendation strategies
- [ ] Rate limiting and WAF on CloudFront
- [ ] Monitoring (CloudWatch, health dashboards)
- [ ] Path-based Amplify builds (only build when `web/` changes)

---

## 🙏 Acknowledgments

- **Spotify** for the Web API and OAuth
- **OpenAI** for text-to-emotion and explanations
- **ONNX** and the open-source emotion model used for face-based mood detection

---

<div align="center">

**Built with ❤️ using TypeScript, Python, Next.js, FastAPI, and Spotify**

⭐ Star this repo if you find it helpful!

</div>
