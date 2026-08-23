# AI Content Automation Platform

An autonomous AI Content Operations Platform for YouTube and Facebook.

The system discovers topics, researches them, verifies facts, generates scripts, produces media, renders videos, checks quality and compliance, schedules, publishes, collects analytics, and optimizes future content — with the owner monitoring and controlling everything from the frontend.

---

## Architecture

```
Frontend (Next.js + shadcn/ui + Redux)
        ↓
Backend API (NestJS + MongoDB + Redis)
        ↓
Queue (BullMQ)
        ↓
Workers: AI Worker · Media Worker (FFmpeg) · Publish Worker
        ↓
Platforms: YouTube · Facebook
        ↓
Analytics → AI Strategy → Next Content
```

External automation layer: **n8n** (scheduled triggers, notifications, integrations)

---

## Tech Stack

| Layer          | Technology                                                             |
| -------------- | ---------------------------------------------------------------------- |
| Frontend       | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, RTK Query |
| Backend        | NestJS, TypeScript, MongoDB, Mongoose, Redis, BullMQ                   |
| Workers        | NestJS (worker), NestJS (media-worker), FFmpeg                         |
| Automation     | n8n (external workflows only)                                          |
| Storage        | Object storage (MinIO for local dev, S3-compatible for production)     |
| Infrastructure | Docker, Docker Compose, GitHub Actions                                 |

---

## Monorepo Structure

```
apps/
├── web/          — Next.js frontend
├── api/          — NestJS backend API
├── worker/       — AI/research/publishing worker
└── media-worker/ — FFmpeg media rendering worker

packages/
├── types/        — Shared TypeScript type contracts
├── validation/   — Shared Zod schemas
├── ui/           — Shared design system extensions
├── config/       — Shared configuration types
├── eslint-config/ — Shared ESLint configuration
└── tsconfig/     — Shared TypeScript configuration

infrastructure/
├── docker/       — Dockerfiles for production
└── nginx/        — Reverse proxy configuration

docs/
├── architecture/ — Architecture documentation
├── database/     — Collection and index documentation
├── workflows/    — Pipeline documentation
└── decisions/    — Architecture Decision Records (ADRs)
```

---

## Local Development Setup

### Prerequisites

- Node.js 22 LTS
- pnpm 9+
- Docker Desktop

### Install

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

### Start Infrastructure

```bash
docker compose up -d
```

This starts: MongoDB, Redis, MinIO, n8n

### Start Applications

```bash
pnpm dev
```

This starts all apps in parallel via Turborepo.

Individual apps:

```bash
pnpm --filter web dev        # Next.js on :3000
pnpm --filter api dev        # NestJS on :3001
pnpm --filter worker dev     # Worker
pnpm --filter media-worker dev  # Media Worker
```

---

## Environment Variables

Copy `.env.example` to `.env.local` (frontend) and `.env` (backend).

See `.env.example` for all required variables.

**Never commit real secrets.**

---

## Available Ports (Local Development)

| Service       | Port  |
| ------------- | ----- |
| Next.js       | 3000  |
| NestJS API    | 3001  |
| MongoDB       | 27017 |
| Redis         | 6379  |
| MinIO API     | 9000  |
| MinIO Console | 9001  |
| n8n           | 5678  |

---

## Development Commands

```bash
pnpm dev          # Start all apps
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript check all packages
pnpm test         # Run all tests
```

---

## Documentation

| File           | Purpose                               |
| -------------- | ------------------------------------- |
| `plan.md`      | Architecture and product requirements |
| `PROGRESS.md`  | Current implementation state          |
| `PENDING.md`   | Work not yet completed                |
| `ERROR.md`     | Error and debugging history           |
| `ADVICE.md`    | Architectural advice and decisions    |
| `CHANGELOG.md` | Change history                        |

---

## Current Phase

**Phase 0 — Foundation**

See `PROGRESS.md` for current state.
See `PENDING.md` for remaining work.

---

## Development Phases

| Phase | Scope                                             |
| ----- | ------------------------------------------------- |
| 0     | Foundation — monorepo, tooling, Docker, base apps |
| 1     | Authentication — users, workspace, RBAC           |
| 2     | Dashboard — layout, sidebar, theme                |
| 3     | Content Core — library, CRUD, versions            |
| 4     | Research — agent, sources, facts                  |
| 5     | Script — agent, versioning, fact validation       |
| 6     | Media — assets, voice, thumbnails                 |
| 7     | Rendering — FFmpeg, media worker, quality         |
| 8     | YouTube — OAuth, upload, analytics                |
| 9     | Facebook — OAuth, upload, analytics               |
| 10    | Automation — BullMQ, n8n, scheduler               |
| 11    | Analytics — snapshots, charts, AI analysis        |
| 12    | Autonomous Mode — full content loop               |
