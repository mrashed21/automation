# Pending Work

## High Priority (Phase 03 — Content Core & Library)

- [ ] Content schema & models (`content`, `content-versions`)
- [ ] Content CRUD API (`/api/v1/content`) with workspace isolation
- [ ] Content Library UI (grid/table view, filter bar, status badges)
- [ ] Content details tabs (Overview, Script, Research, Facts, Media, Video, Thumbnail, Publishing, Analytics, Activity, Versions)

## Medium Priority (Phase 04-07 — AI & Media Pipelines)

- [ ] AI Provider abstraction layer (`AiTextProvider`, `AiImageProvider`, `AiVoiceProvider`)
- [ ] Research agent & fact verification engine
- [ ] Script generator & versioning engine
- [ ] Media asset management & object storage (MinIO/S3)
- [ ] Media worker FFmpeg render pipeline

## Low Priority (Phase 08-12 — Publishing, Automation & Autonomous Loop)

- [ ] YouTube OAuth & Publishing adapter
- [ ] Facebook OAuth & Publishing adapter
- [ ] n8n webhook integrations & automated trigger workflows
- [ ] Analytics sync & snapshot collection
- [ ] Autonomous Strategist Agent & loop optimization

## Blocked

None.

---

## Completed

- [x] Phase 00: Foundation (Monorepo, shared packages, Next.js web, NestJS API, workers, Docker, CI, tests)
- [x] Phase 01: Authentication & Workspaces (JWT, refresh token cookies, RBAC, Mongoose schemas, auth pages, RTK Query)
- [x] Phase 02: Dashboard & Workspace Shell (collapsible sidebar, workspace switcher, user menu, theme toggle, metric cards, workspace settings form, team members management UI)
