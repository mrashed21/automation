# Changelog

## [0.8.0] - 2026-08-29

### Added - Phase 10: Automation Engine, n8n Webhooks & Analytics Sync

- **Automation Engine Backend (`AutomationModule`)**:
  - Mongoose schemas `AutomationRule` (cron schedule, webhook HMAC trigger, manual trigger, target platforms, daily quota, approval mode) and `AutomationRun` (embedded `PipelineStage` execution history tracking research, script, media, render, quality-check, and publish stages).
  - `AutomationService` & `AutomationController`: REST endpoints for rule management (`GET/POST /api/v1/automation/rules`, `PATCH /api/v1/automation/rules/:id`, `POST /api/v1/automation/rules/:id/toggle`, `DELETE /api/v1/automation/rules/:id`, `POST /api/v1/automation/rules/:id/trigger`), run history querying (`GET /api/v1/automation/runs`), system status summary (`GET /api/v1/automation/status`), and HMAC `sha256` verified n8n webhook trigger (`POST /api/v1/automation/webhook/:ruleId`).
- **Analytics Sync Engine Backend (`AnalyticsModule`)**:
  - Mongoose schema `AnalyticsSnapshot` capturing time-series snapshots (views, likes, comments, shares, watch time, average duration, retention percent, CTR, subscribers/followers gained).
  - `AnalyticsService` & `AnalyticsController`: Endpoints for content snapshot history (`GET /api/v1/content/:id/analytics/snapshots`), latest metrics per platform (`GET /api/v1/content/:id/analytics/latest`), manual sync trigger (`POST /api/v1/content/:id/analytics/sync`), and workspace-wide aggregated performance summary (`GET /api/v1/analytics/summary`).
- **Frontend Analytics Studio (`AnalyticsTabView`)**:
  - KPI metric cards with accent glow headers (Total Views, Likes, Comments, Shares, Avg CTR).
  - Per-platform breakdown rows with individual retention curves and watch time stats.
  - Interactive Recharts Area Chart displaying historical growth curves with metric switching (views, likes, comments, shares) and platform color-coded gradient fills.
  - One-click "Sync Now" button wired to `useSyncAnalyticsMutation`.
- **Frontend Automation Dashboard (`/dashboard/automation`)**:
  - System health strip monitoring API, MongoDB, Redis, Worker, Media Worker, and n8n statuses.
  - Live metric counters (Total Rules, Active Rules, Completed Today, Failed Today, Queued Jobs).
  - Interactive rule management cards with enable/disable toggles, instant trigger buttons, and delete actions.
  - Rule Builder Dialog modal supporting cron schedule presets, platform multi-selection, content-per-run slider, and approval mode pickers.
  - Run History timeline view with color-coded stage progress dots and failure diagnostic logs.
  - n8n Webhook integration reference card with signature requirements and endpoint URLs.
- **Testing & Monorepo Verification**:
  - Unit test suites for `AutomationService` and `AnalyticsService` (53 total passing unit tests across 4 packages).
  - Zero errors across `pnpm type-check`, `pnpm lint`, `pnpm test`, and `pnpm build`.

---

## [0.7.0] - 2026-08-29

### Added - Phase 08: Social Publishing Adapters & OAuth Integration

- **Social Publishing Adapters**:
  - `YouTubePublisher`: YouTube Data API v3 integration handling video uploads, category IDs, privacy visibility (`public`, `unlisted`, `private`), and custom tags.
  - `FacebookPublisher`: Meta Graph API / Reels publisher handling video post creation, page access token authorization, and caption/tag formatting.
- **Publishing Backend Module (`PublishingModule`)**:
  - Mongoose schemas `SocialAccount` and `Publication` with compound workspace indexes and token lifetime tracking.
  - `PublishingService` & `PublishingController`: Endpoints for OAuth account linking (`POST /api/v1/social/accounts/connect`), account disconnection (`DELETE /api/v1/social/accounts/:id`), immediate video publishing (`POST /api/v1/content/:id/publish`), scheduled publishing (`POST /api/v1/content/:id/schedule`), and publication history retrieval (`GET /api/v1/content/:id/publications`).
- **Frontend Publishing Studio (`PublishingTabView`)**:
  - Connected Channels & Pages banner with real-time status indicators and quick-connect OAuth modal.
  - Interactive publishing studio form with target platform switcher (YouTube vs Facebook), SEO metadata inputs, category selector, privacy controls, and schedule date/time picker.
  - Live publication list displaying direct links to published YouTube/Facebook videos, status badges, and account attribution.
- **Testing & Quality Assurance**:
  - Unit tests for `PublishingService` (41 passing tests repo-wide).
  - Clean validation across `type-check`, `lint`, and full production build.

---

## [0.6.0] - 2026-08-29


### Added - Phase 07: FFmpeg Media Worker Render Pipeline & Video Composition

- **FFmpeg Media Rendering Pipeline**:
  - `FfmpegRenderService` multi-scene timeline assembler with 16:9 Long-form (1920x1080) and 9:16 Vertical Shorts/Reels (1080x1920) resolution dimensions.
  - Audio mixer with voice narration overlay and automatic ducking (-16dB) of background music beds.
  - Automated timed ASS/SRT subtitle generator with vertical safe margin padding (clearing TikTok / YouTube Shorts UI button overlays).
- **BullMQ Render Worker Host**:
  - `RenderProcessor` worker host processing video render jobs on `QUEUE_NAMES.RENDER`.
  - Incremental job progress broadcasting (`updateProgress`) and pipeline status tracking.
- **Backend API Video Dispatch**:
  - `POST /api/v1/content/:id/render` endpoint triggering video rendering and state transitions to `rendering` and `ready`.
  - `GET /api/v1/content/:id/render/status` endpoint for real-time progress polling.
- **Frontend Video Render Studio**:
  - `MediaTabView` Video Render Studio with aspect ratio toggle, subtitle styling selector, background music slider, and one-click render trigger.
  - Embedded HTML5 video player for rendered MP4 playback with download action.
- **Testing & Quality Assurance**:
  - Comprehensive unit test suites for `FfmpegRenderService` and `MediaAssetsService` render endpoints (36 passing unit tests across 4 packages).
  - Zero-error validation across type-check, linting, and full production build.

---

## [0.5.0] - 2026-08-29


### Added - Phase 06: Media Assets Management, Object Storage, Voice Generation & Thumbnail Studio

- **Object Storage & Media Asset Service**:
  - `StorageService` providing S3/MinIO compatible object storage with presigned upload/download URLs, SHA256 integrity checksums, and local persistent filesystem fallback.
  - Mongoose schemas: `MediaAsset` (MIME types, dimensions, durations, license tracking, checksums), `ThumbnailAsset` (variants A/B/C/D, CTR scoring), `VoiceAsset` (ElevenLabs voice metadata, audio format).
  - `MediaAssetsService` and `MediaAssetsController` endpoints for presigned URLs, direct multipart uploads, workspace media library querying, and asset deletion.
- **AI Voice Narration Engine**:
  - Neural voice generation integration utilizing ElevenLabs models (Rachel, Domi, Bella, Antoni, Josh).
  - Real-time audio player, waveform visualizer, voice stability/similarity sliders, and custom script override support.
- **High-CTR Thumbnail Studio**:
  - AI Thumbnail variant generator producing 3-4 distinct visual concepts (YouTube High-CTR, Modern Vibrant, Cinematic Dramatic, Minimal Sleek).
  - Headline typography overlays, CTR score estimation badges, and one-click primary thumbnail selection.
- **Testing & Verification**:
  - Full unit test suites for `StorageService` and `MediaAssetsService` (27 passing API tests, 31 total repo-wide).
  - Zero-error monorepo type-check, lint, and production bundle build.

---

## [0.4.0] - 2026-08-29


### Added - Phase 04 & 05: AI Providers, Autonomous Research & Script Studio

- **AI Provider Abstraction Layer**:
  - `IAiTextProvider`, `IAiImageProvider`, and `IAiVoiceProvider` multi-modal contracts.
  - `AiService` orchestrator with retry policies and strict Zod validation pipeline.
  - `GeminiTextProvider` for Google Gemini models with structured JSON extraction.
- **Autonomous Research & Fact-Checking Engine**:
  - Mongoose schemas: `Research`, `ResearchSource`, `ResearchFact` with workspace compound indexing.
  - `ResearchService` synthesizing executive summaries, web citations, reliability scores, and verifiable claims.
  - `ResearchController` (`/api/v1/content/:id/research`, `/api/v1/content/:id/research/facts/:factId`, `/api/v1/content/:id/research/verify`).
  - `ResearchTabView` with depth controls (fast/standard/deep), confidence badges, citation links, and claim status toggles.
- **Script Generator & Versioning Studio**:
  - Mongoose schemas: `Script` (sections with durations, word counts, visual cues) and `ScriptVersion` (immutable snapshots).
  - `ScriptService` generating high-retention structured video scripts.
  - `ScriptController` (`/api/v1/content/:id/script`, `/api/v1/content/:id/script/versions`).
  - `ScriptTabView` studio editor with live pacing/duration calculations, visual cue editors, and revision timeline diffs.
- **Testing & Verification**:
  - Comprehensive unit test suites for `AiService`, `ResearchService`, and `ScriptService`.
  - Zero-error validation across type-check, lint, and unit test suites.

---

## [0.3.0] - 2026-08-26

### Added - Phase 03: Content Core & Library

- **Mongoose Schemas & Backend Content Engine**:
  - `Content` and `ContentVersion` schemas with full workspace isolation.
  - `ContentService` with pagination, lifecycle status transitions, filters, and immutable history tracking.
  - `ContentController` (`/api/v1/content`, `/api/v1/content/:id`, `/api/v1/content/:id/versions`).
- **Frontend Content Library**:
  - `ContentTable` and `ContentGrid` views with live search and status filters.
  - `CreateContentDialog` with form validation.
  - `ContentDetailsTabs` 8-tab studio inspector.

---

## [0.2.0] - 2026-08-23

### Added - Phase 01: Authentication & Workspaces

- **Backend Authentication & Mongoose Schemas**:
  - `User` schema with unique lowercase email index and bcrypt password hashing.
  - `RefreshToken` schema with SHA256 hashed storage, TTL auto-expiration index, and reuse detection.
  - `Workspace` schema with multi-tenancy settings, slug generation, and automation configs.
  - `WorkspaceMember` schema with compound unique index and hierarchical RBAC roles (`owner`, `admin`, `editor`, `viewer`).
- **Security & Passport Strategies**:
  - `JwtStrategy` extracting Bearer tokens with user existence validation.
  - `LocalStrategy` for email/password authentication.
  - `JwtAuthGuard` supporting `@Public()` decorator route bypass.
  - `WorkspaceGuard` validating tenant access via headers, query, or path parameters.
  - `RolesGuard` enforcing hierarchical RBAC.
  - Parameter decorators: `@CurrentUser()`, `@CurrentWorkspace()`, `@Roles()`, `@Public()`.
- **Auth & Workspace REST APIs**:
  - `POST /api/v1/auth/register` (creates user + default workspace, sets HttpOnly refresh cookie).
  - `POST /api/v1/auth/login` (validates credentials, sets HttpOnly refresh cookie).
  - `POST /api/v1/auth/refresh` (rotates refresh token cookie, returns new access token).
  - `POST /api/v1/auth/logout` (revokes refresh token and clears cookie).
  - `GET /api/v1/auth/me` (returns user profile and workspace list).
  - `GET /api/v1/workspaces`, `POST /api/v1/workspaces`, `GET /api/v1/workspaces/:id`, `PATCH /api/v1/workspaces/:id`.
  - `GET /api/v1/workspaces/:id/members`, `POST /api/v1/workspaces/:id/members`, `PATCH /api/v1/workspaces/:id/members/:userId`, `DELETE /api/v1/workspaces/:id/members/:userId`.
- **Frontend UI & State Management**:
  - Reusable UI primitives: `Button`, `Input`, `Label`, `Card`.
  - `LoginForm` and `RegisterForm` with React Hook Form, Zod schema validation, and Sonner toast notifications.
  - `(auth)/login` and `(auth)/register` routes with branded `(auth)/layout.tsx`.
  - `authApi` and `workspaceApi` RTK Query endpoints injecting into `baseApi` with automatic Redux store synchronization.
  - `AuthGuard` client component for route protection.
- **Testing & Quality Assurance**:
  - Unit test suites for `AuthService` (registration, login, token rotation) and `WorkspaceGuard` (multi-tenant isolation).
  - Monorepo validation passed 100% (`pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build`).

---

## [0.1.0] - 2026-08-23

### Added - Phase 00: Foundation

- Initial monorepo setup with pnpm workspaces and Turborepo.
- Shared packages (`@repo/tsconfig`, `@repo/eslint-config`, `@repo/types`, `@repo/validation`, `@repo/config`, `@repo/ui`).
- Next.js 16 frontend and NestJS 10 backend API with BullMQ and MongoDB connections.
- Worker applications (`apps/worker`, `apps/media-worker`).
- Docker Compose, Dockerfiles, and GitHub Actions CI.
