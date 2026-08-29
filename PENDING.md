# Pending Work

## High Priority (Phase 06-07 — Media Assets & FFmpeg Worker)

- [ ] Media asset management & object storage (MinIO/S3 upload and presigned URLs)
- [ ] Voice generation pipeline (ElevenLabs/TTS)
- [ ] Thumbnail generation & variant testing
- [ ] Media worker FFmpeg render pipeline (audio/video composition)

## Medium Priority (Phase 08-09 — Social Publishing Adapters)

- [ ] YouTube OAuth & Publishing adapter
- [ ] Facebook OAuth & Publishing adapter

## Low Priority (Phase 10-12 — Automation, Analytics & Autonomous Loop)

- [ ] n8n webhook integrations & automated trigger workflows
- [ ] Analytics sync & snapshot collection
- [ ] Autonomous Strategist Agent & loop optimization

## Blocked

None.

---

## Completed

- [x] Phase 00: Foundation (Monorepo, shared packages, Next.js web, NestJS API, workers, CI, tests)
- [x] Phase 01: Authentication & Workspaces (JWT, refresh token cookies, RBAC, Mongoose schemas, auth pages, RTK Query)
- [x] Phase 02: Dashboard & Workspace Shell (collapsible sidebar, workspace switcher, user menu, theme toggle, metric cards, workspace settings form, team members management UI)
- [x] Phase 03: Content Core & Library (Mongoose schemas, ContentModule CRUD API with workspace isolation, immutable ContentVersion tracking, Content Library table/grid views, filters, creation dialog, 8-tab details inspector)
- [x] Phase 04: AI Provider Abstraction & Autonomous Research Agent (`AiService`, `GeminiTextProvider`, retry pipeline, `ResearchModule` CRUD, authoritative sources synthesis, fact claim extraction, `ResearchTabView`)
- [x] Phase 05: Script Generator & Versioning Engine (`ScriptModule` multi-section generator, duration & pacing calculation, immutable `ScriptVersion` history, manual studio editor, `ScriptTabView`)
