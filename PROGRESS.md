# Project Progress

## Current Phase

Phase 03 — Content Core & Library (Phase 02 Dashboard & Workspace Shell Completed)

## Completed

- [x] Phase 00: Foundation (Monorepo, shared packages, Next.js web, NestJS API, workers, Docker, CI, tests)
- [x] Phase 01: Authentication & Multi-Tenant Workspaces
  - [x] Mongoose User Schema with unique lowercase email index & bcrypt password hashing
  - [x] Mongoose RefreshToken Schema with TTL index and token rotation tracking
  - [x] Mongoose Workspace Schema with multi-tenancy attributes and automation settings
  - [x] Mongoose WorkspaceMember Schema with unique compound index & RBAC roles
  - [x] Passport JWT Strategy (`JwtStrategy`) and Local Strategy (`LocalStrategy`)
  - [x] Authentication Service (`AuthService`) with registration, login, token rotation, and reuse detection
  - [x] Authentication Controller (`AuthController`) with secure HttpOnly cookies (`/register`, `/login`, `/refresh`, `/logout`, `/me`)
  - [x] Workspaces Service & Controller with member invitations, role management, and settings updates
  - [x] Multi-tenant isolation guards (`JwtAuthGuard`, `WorkspaceGuard`, `RolesGuard`)
  - [x] Request decorators (`@CurrentUser()`, `@CurrentWorkspace()`, `@Roles()`, `@Public()`)
  - [x] Shared validation schemas (`auth.schema.ts`, `workspace.schema.ts`)
  - [x] Shared TypeScript contracts (`auth.types.ts`, `workspace.types.ts`)
  - [x] Frontend UI primitives (`Button`, `Input`, `Label`, `Card`)
  - [x] Frontend Auth forms (`LoginForm`, `RegisterForm`) with React Hook Form + Zod + Sonner toasts
  - [x] Frontend Auth pages (`(auth)/login`, `(auth)/register`, landing page)
  - [x] Frontend RTK Query API slices (`authApi`, `workspaceApi`) synchronized with Redux store
  - [x] Automated unit test suites for auth service and workspace guard
  - [x] Zero-error verification for type-check, lint, test, and production build
- [x] Phase 02: Dashboard Layout & Workspace Shell
  - [x] Expanded CSS design token system (full light/dark palette, sidebar tokens, header tokens, transition vars)
  - [x] Radix UI primitives (`DropdownMenu`, `Avatar`, `Badge`, `Select`, `Separator`, `Skeleton`, `Tooltip`)
  - [x] `app/(dashboard)/layout.tsx` — server layout with `AuthGuard` wrap
  - [x] `DashboardContentWrapper` — client component bridging Redux collapsed state to CSS class
  - [x] `DashboardSidebar` — collapsible sidebar with workspace switcher, grouped nav, tooltips in collapsed mode
  - [x] `DashboardHeader` — sticky header with sidebar toggle, theme picker, and user menu
  - [x] `WorkspaceSwitcher` — dropdown reading from Redux, dispatches `selectWorkspace` on selection
  - [x] `UserMenu` — avatar dropdown with name/email, settings nav, and logout action
  - [x] `MetricCard` — reusable dashboard metric card with icon, value, trend badge
  - [x] `StatsRow` — three-card dashboard overview (pipeline, scheduled, published)
  - [x] `WorkspaceSettingsForm` — React Hook Form + Zod bound to `updateWorkspace` RTK mutation
  - [x] `InviteMemberForm` — invite by email + role using `inviteMember` RTK mutation
  - [x] `TeamMembersTable` — member list with skeleton loading, role select per member, remove action
  - [x] `/dashboard` — home page with metric cards and activity placeholder
  - [x] `/dashboard/settings/workspace` — workspace settings page
  - [x] `/dashboard/settings/team` — team members management page
  - [x] Zero-error verification for type-check and lint (2 RHF `watch()` compiler info warnings only)

## In Progress

- [ ] Phase 03: Content Core & Library

## Recently Completed

### 2026-08-29

- Implemented full Phase 02 Dashboard & Workspace Shell.
- Built collapsible sidebar with workspace switcher, themed navigation, and tooltip support in collapsed mode.
- Wired sidebar collapse, theme toggle, and workspace selection to existing Redux slices (no new slices needed).
- Built workspace settings form and team members management UI backed by existing RTK Query mutations.
- Installed Radix UI primitives (DropdownMenu, Avatar, Select, Separator, Tooltip) and wrote shadcn-compatible wrappers.
- Verified zero type errors (`pnpm type-check`) and zero lint errors (`pnpm lint`).

## Current System Status

Frontend (`apps/web`):
Auth & Workspace UI ready (`/login`, `/register`, landing page)
Dashboard shell ready (`/dashboard`, `/dashboard/settings/workspace`, `/dashboard/settings/team`)
Sidebar, header, workspace switcher, user menu, theme toggle all functional

Backend API (`apps/api`):
Auth & Multi-Tenant Workspaces ready (`/auth/*`, `/workspaces/*`, `/users/*`, `/health`)

Workers (`apps/worker` & `apps/media-worker`):
Foundation ready (BullMQ queue registration, builds cleanly)

Database:
Mongoose schemas registered (`users`, `refresh-tokens`, `workspaces`, `workspace-members`)

Cache & Queues:
Redis configured with BullMQ queues

Storage:
MinIO S3 configuration defined

Authentication:
Completed (JWT + HttpOnly cookie refresh token rotation + RBAC)

Content Pipeline:
Not implemented (Phase 03+)

AI Agents & Pipelines:
Not implemented (Phase 04+)

Publishing & Social Adapters:
Not implemented (Phase 08-09)

Analytics:
Not implemented (Phase 11)

## Last Updated

2026-08-29
