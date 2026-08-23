# Architecture Overview

## System Diagram

```
Frontend (Next.js + shadcn/ui + Redux)
         ↓
Backend API (NestJS + MongoDB + Redis)
         ↓
Queue (BullMQ on Redis)
         ↓
Workers: AI Worker · Media Worker (FFmpeg) · Publish Worker
         ↓
Platforms: YouTube · Facebook
         ↓
Analytics → AI Strategy → Next Content
```

External automation layer: **n8n** (scheduled triggers, notifications, integrations — NOT core logic)

## Key Architecture Rules

1. MongoDB is the primary application database.
2. NestJS owns all backend business logic.
3. Next.js owns the frontend.
4. Redux Toolkit + RTK Query owns frontend state.
5. shadcn/ui owns the base UI system.
6. BullMQ + Redis handles all async long-running jobs.
7. n8n handles external workflow automation only.
8. FFmpeg runs inside the dedicated media-worker.
9. AI providers are accessed through provider interfaces only.
10. Social platforms are accessed through publisher adapters only.
11. Large media files never live inside MongoDB (only metadata).
12. Every external publication is idempotent.
13. Every AI output is validated before use.
14. Required platform disclosures are never bypassed.

## Request Flow

```
User Browser
    ↓ HTTP
Next.js (Frontend)
    ↓ RTK Query
NestJS API (/api/v1/...)
    ↓ Mongoose
MongoDB
    ↓ BullMQ job created
Redis
    ↓ Job processed
Worker (AI / Research / Publishing)
    ↓ Result stored
MongoDB
    ↓ WebSocket/SSE notification
Frontend (live update)
```
