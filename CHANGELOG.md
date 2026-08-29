# Changelog

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
