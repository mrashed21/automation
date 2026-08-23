# Technical Advice

## ADV-001

Date:
2026-08-23

Area:
Architecture

Advice:
Keep FFmpeg video rendering completely outside the NestJS API process.

Reason:
FFmpeg jobs are CPU-intensive and blocking. Running them inside the API process would degrade API response times and risk crashing the primary application under load.

Recommendation:
Use the dedicated `apps/media-worker` application. The API creates a BullMQ job; the media-worker processes it asynchronously. The API only tracks status.

Status:
Accepted (reflected in plan.md section 6 and the monorepo structure)

---

## ADV-002

Date:
2026-08-23

Area:
Architecture

Advice:
Keep all core domain logic inside NestJS, not n8n.

Reason:
n8n workflows are difficult to version-control, test, and refactor compared to NestJS modules. Moving business logic into n8n creates an untestable, unmaintainable system over time.

Recommendation:
Use n8n exclusively for: scheduled triggers, webhooks, notifications, external integrations, backup workflows, and cross-service operational automation. NestJS handles all authentication, authorization, content pipeline logic, AI orchestration, and database writes.

Status:
Accepted (plan.md sections 25, 92)

---

## ADV-003

Date:
2026-08-23

Area:
Security

Advice:
Never expose OAuth access tokens, refresh tokens, or AI API keys to the browser.

Reason:
A single leaked token can compromise a YouTube/Facebook account or exhaust AI API quota. The browser is an untrusted environment.

Recommendation:
OAuth tokens are stored encrypted at rest in MongoDB (server-side only). Frontend receives only safe account metadata (channel name, status, last-sync). All API calls to external platforms are made server-side through NestJS or workers.

Status:
Accepted (plan.md sections 35, 64)

---

## ADV-004

Date:
2026-08-23

Area:
AI Safety

Advice:
Every AI output must be validated through a schema + business + quality pipeline before being stored or published.

Reason:
Raw LLM output is unpredictable. Without validation, invalid JSON, hallucinated facts, incomplete scripts, or policy-violating content could reach publishing.

Recommendation:
Implement the AI output pipeline: AI → Zod schema validation → business validation → fact validation → quality validation → database. Failed output goes to retry queue. Repeated failures go to dead-letter queue with human notification.

Status:
Accepted (plan.md sections 24, 96)

---

## ADV-005

Date:
2026-08-23

Area:
Authentication & Security

Advice:
Use short-lived JWT access tokens + HttpOnly rotated refresh token cookies with strict server-side workspace isolation.

Reason:
Storing tokens in `localStorage` makes the application vulnerable to XSS token theft. Passing workspace IDs solely in request bodies without validating membership allows privilege escalation between workspaces.

Recommendation:
1. Issue short-lived access tokens (15 minutes).
2. Store refresh tokens in HttpOnly, Secure, SameSite=Strict cookies and rotate token IDs upon each refresh.
3. Every protected API request must validate both user identity (`JwtAuthGuard`) and workspace membership/role (`WorkspaceGuard` and `RolesGuard`).
4. Every MongoDB query must be explicitly scoped by `workspaceId`.

Status:
Accepted (plan.md sections 58, 59, 60)

---
