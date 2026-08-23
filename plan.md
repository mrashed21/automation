# AI Content Automation Platform — `plan.md`

> **Project type:** Autonomous AI Content Operations Platform  
> **Primary platforms:** YouTube + Facebook  
> **Architecture:** Monorepo, feature-based, event-driven, queue-based  
> **Frontend:** Next.js + TypeScript + shadcn/ui + Redux Toolkit  
> **Backend:** NestJS + TypeScript + MongoDB  
> **Automation:** n8n + BullMQ/Redis + scheduled workers  
> **Media:** FFmpeg + object storage  
> **Code style:** Clean, professional, human-readable, reusable, maintainable  
> **Naming:** kebab-case for files/folders  
> **Goal:** The owner develops/configures the system; AI and workers perform the recurring content operation.

---

## 1. Product Vision

The platform should operate as an AI-powered content operation rather than a simple post scheduler.

The system should be able to:

1. Discover content opportunities.
2. Research topics.
3. Store sources and claims.
4. Generate original scripts.
5. Verify factual claims.
6. Plan scenes.
7. Generate or source permitted media.
8. Generate narration.
9. Render videos.
10. Generate thumbnails.
11. Run quality checks.
12. Run platform/compliance checks.
13. Schedule content.
14. Publish to connected platforms.
15. Collect analytics.
16. Analyze performance.
17. Adjust future content strategy.
18. Retry failed jobs automatically.
19. Keep complete internal audit/provenance records.
20. Expose all important activity through the frontend.

The owner should not need to manually create each piece of content.

---

# 2. Important Content Integrity Rule

The system may remove unnecessary technical metadata from generated media, such as:

- Temporary renderer metadata
- Internal job IDs
- Local file paths
- Debug metadata
- Temporary processing tags
- Unnecessary EXIF fields
- Internal storage information

However, the system must **not** remove, bypass, or falsify:

- Platform-required AI disclosures
- Copyright attribution
- License requirements
- Required creator/rights information
- Legal disclosures
- Required labels
- Content provenance needed for internal auditing

Internal provenance must remain stored in the database.

Every asset should be traceable internally to:

```text
asset
source
license
creator/provider
generation method
generation job
created-at
content-id
```

The public media file can be clean while the internal system retains complete provenance.

---

# 3. Core Product Principles

## 3.1 Feature Based

Organize code by business feature, not by technical file type.

Avoid:

```text
controllers/
services/
components/
utils/
```

as the primary organization.

Prefer:

```text
features/
  content/
  research/
  publishing/
  analytics/
```

Each feature owns its UI, API logic, types, validation, and business-specific utilities.

---

## 3.2 Reusable

Prefer:

- Reusable functions
- Reusable hooks
- Reusable UI components
- Provider interfaces
- Adapter patterns
- Shared validation
- Shared error handling
- Shared API response types

Avoid duplicated business logic.

---

## 3.3 Human Readable

Code should look like code written by a careful developer.

Prefer:

```ts
const publishedContent = await contentRepository.findPublishedContent();
```

Avoid:

```ts
const x = await repo.f({ s: 1 });
```

No unnecessary clever abstractions.

---

## 3.4 Small Functions

Functions should have one clear responsibility.

Avoid giant services.

Prefer:

```text
research-topic
verify-fact
generate-script
render-video
publish-video
```

as separate responsibilities.

---

## 3.5 Strict TypeScript

Use strict TypeScript.

Avoid:

```ts
any;
```

unless there is a documented unavoidable boundary.

---

# 4. Technology Stack

## Frontend

- Next.js latest stable version at project bootstrap
- React latest compatible stable version
- TypeScript latest stable version
- Tailwind CSS latest stable version
- shadcn/ui
- Base UI as the preferred shadcn base for a new project
- Redux Toolkit
- React Redux
- RTK Query
- React Hook Form
- Zod
- Lucide icons
- Recharts or another lightweight charting solution where needed
- date-fns

Current shadcn/ui projects default to Base UI; Radix remains supported. Pin the chosen base during project initialization rather than mixing primitives arbitrarily.

---

## Backend

- NestJS latest stable version at project bootstrap
- Node.js active LTS version
- TypeScript
- MongoDB
- Mongoose
- Redis
- BullMQ
- Zod where shared validation is useful
- NestJS validation/transform pipeline
- Passport/JWT or secure session strategy
- Axios/fetch through a centralized HTTP layer
- Pino-compatible structured logging

---

## Automation

- n8n self-hosted
- Redis
- BullMQ
- Cron/scheduler
- Webhooks
- Queue workers
- Platform APIs

n8n should orchestrate external workflow integrations and operational automation.

Core business logic should remain inside NestJS so the application is testable and maintainable.

---

## Media

- FFmpeg
- FFprobe
- Image processing library
- Object storage
- Optional CDN
- Subtitle/caption generation
- Audio normalization

---

## Infrastructure

- Docker
- Docker Compose for local development
- GitHub Actions
- Reverse proxy
- HTTPS
- Environment-based configuration
- Health checks
- Error tracking
- Backup strategy

---

# 5. Monorepo

Use `pnpm` workspaces.

```text
ai-content-platform/
│
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── media-worker/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   ├── config/
│   ├── eslint-config/
│   └── tsconfig/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── workflows/
│   └── decisions/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

# 6. Why Separate `worker` and `media-worker`

Do not run expensive rendering inside the API process.

## API

Responsible for:

- Authentication
- CRUD
- Business operations
- Creating jobs
- Returning status
- WebSocket/SSE events

## Worker

Responsible for:

- Research
- AI calls
- Fact checking
- Script generation
- Publishing
- Analytics

## Media Worker

Responsible for:

- FFmpeg
- Video rendering
- Audio processing
- Subtitle rendering
- Thumbnail processing

This prevents video rendering from blocking API traffic.

---

# 7. Frontend Folder Structure

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── workspaces/
│   │   ├── content/
│   │   ├── research/
│   │   ├── scripts/
│   │   ├── media/
│   │   ├── videos/
│   │   ├── thumbnails/
│   │   ├── publishing/
│   │   ├── scheduling/
│   │   ├── analytics/
│   │   ├── monetization/
│   │   ├── automation/
│   │   ├── ai-agents/
│   │   ├── platform-accounts/
│   │   ├── activity/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── data-table/
│   │   ├── charts/
│   │   ├── forms/
│   │   └── feedback/
│   │
│   ├── store/
│   ├── hooks/
│   ├── lib/
│   ├── config/
│   ├── types/
│   └── styles/
│
└── public/
```

---

# 8. Backend Folder Structure

```text
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── workspaces/
│   │   ├── workspace-members/
│   │   ├── platform-accounts/
│   │   ├── content/
│   │   ├── content-versions/
│   │   ├── research/
│   │   ├── research-sources/
│   │   ├── research-facts/
│   │   ├── scripts/
│   │   ├── media-assets/
│   │   ├── voices/
│   │   ├── thumbnails/
│   │   ├── videos/
│   │   ├── publishing/
│   │   ├── scheduling/
│   │   ├── analytics/
│   │   ├── monetization/
│   │   ├── automation/
│   │   ├── ai-agents/
│   │   ├── ai-jobs/
│   │   ├── activity/
│   │   ├── notifications/
│   │   └── system/
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── middleware/
│   │   └── constants/
│   │
│   ├── database/
│   │   ├── schemas/
│   │   ├── indexes/
│   │   └── migrations/
│   │
│   ├── queues/
│   ├── config/
│   ├── health/
│   ├── app.module.ts
│   └── main.ts
```

---

# 9. Worker Structure

```text
apps/worker/
├── src/
│   ├── jobs/
│   │   ├── research/
│   │   ├── script-generation/
│   │   ├── fact-checking/
│   │   ├── asset-selection/
│   │   ├── voice-generation/
│   │   ├── thumbnail-generation/
│   │   ├── publishing/
│   │   ├── analytics-sync/
│   │   └── strategy-analysis/
│   │
│   ├── agents/
│   │   ├── strategist-agent/
│   │   ├── research-agent/
│   │   ├── script-agent/
│   │   ├── fact-check-agent/
│   │   ├── media-agent/
│   │   ├── quality-agent/
│   │   ├── compliance-agent/
│   │   └── analytics-agent/
│   │
│   ├── providers/
│   ├── queues/
│   ├── services/
│   └── main.ts
```

---

# 10. Media Worker Structure

```text
apps/media-worker/
├── src/
│   ├── render/
│   ├── audio/
│   ├── subtitles/
│   ├── images/
│   ├── thumbnails/
│   ├── ffmpeg/
│   ├── storage/
│   ├── jobs/
│   └── main.ts
```

---

# 11. Shared Packages

## `packages/types`

Shared TypeScript contracts.

```text
content.types.ts
publication.types.ts
analytics.types.ts
ai-job.types.ts
platform.types.ts
```

## `packages/validation`

Shared schemas.

```text
content.schema.ts
workspace.schema.ts
schedule.schema.ts
platform.schema.ts
```

## `packages/ui`

Shared design system extensions.

Do not duplicate shadcn components across applications.

---

# 12. shadcn/ui Design System

Use shadcn/ui as the base design system.

Recommended base:

```text
Base UI
```

Use:

- Button
- Input
- Select
- Combobox
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Card
- Badge
- Table
- Data Table
- Calendar
- Date Picker
- Form
- Tooltip
- Popover
- Command
- Alert Dialog
- Progress
- Skeleton
- Toast/Sonner
- Sidebar
- Breadcrumb
- Pagination

Customize through the project source code instead of creating an unrelated UI system.

The design should feel like a professional SaaS product.

---

# 13. Frontend State Architecture

Use Redux Toolkit.

Use RTK Query for server state/API calls.

```text
Redux
├── auth
├── workspace
├── ui
├── automation
└── preferences

RTK Query
├── contentApi
├── researchApi
├── publishingApi
├── analyticsApi
├── platformApi
├── automationApi
└── systemApi
```

Do not put every API response manually into Redux.

Use RTK Query cache for server state.

Use Redux slices for actual client/application state.

---

# 14. API Layer

Frontend should not call raw `fetch()` everywhere.

Use RTK Query:

```text
features/content/api/content-api.ts
features/analytics/api/analytics-api.ts
features/publishing/api/publishing-api.ts
```

Centralize:

- Base URL
- Authentication
- Refresh handling
- Error normalization
- Request headers
- API tags
- Cache invalidation

---

# 15. Backend API Design

Use REST initially.

Example:

```text
GET    /api/v1/content
GET    /api/v1/content/:id
POST   /api/v1/content
PATCH  /api/v1/content/:id
DELETE /api/v1/content/:id

POST   /api/v1/content/:id/generate
POST   /api/v1/content/:id/fact-check
POST   /api/v1/content/:id/render
POST   /api/v1/content/:id/schedule
POST   /api/v1/content/:id/publish
```

Use:

```text
/api/v1/
```

from the beginning.

---

# 16. MongoDB Architecture

Use MongoDB as the primary database.

Use Mongoose with strict schemas.

Core collections:

```text
users
workspaces
workspace-members
platform-accounts

content
content-versions

researches
research-sources
research-facts

scripts
script-versions

media-assets
voice-assets
video-assets
thumbnail-assets

content-publications
content-schedules

ai-agents
ai-jobs
ai-job-logs

automation-rules
analytics-snapshots
monetization-snapshots

notifications
activity-logs
audit-logs
system-events
```

---

# 17. MongoDB Design Rules

Every collection should have:

```text
_id
createdAt
updatedAt
```

Where appropriate:

```text
createdBy
updatedBy
workspaceId
status
```

Use compound indexes according to actual query patterns.

Examples:

```text
workspaceId + status
workspaceId + createdAt
workspaceId + publishedAt
contentId + createdAt
platformAccountId + publishedAt
```

Do not create indexes blindly.

Review indexes as features are implemented.

---

# 18. Content Schema

Conceptually:

```text
content
├── workspaceId
├── title
├── description
├── contentType
├── language
├── niche
├── status
├── currentVersion
├── scriptId
├── thumbnailAssetId
├── videoAssetId
├── strategyId
├── qualityScore
├── complianceStatus
├── scheduledAt
├── publishedAt
├── createdAt
└── updatedAt
```

---

# 19. Content Versioning

Never overwrite important generated content blindly.

```text
content
    ↓
content-versions

v1
v2
v3
```

Track:

```text
version
source
createdBy
generationJobId
changeReason
createdAt
```

Same approach for:

- Scripts
- Thumbnails
- Videos
- Titles
- Descriptions

---

# 20. Research System

Research document:

```text
research
├── contentId
├── topic
├── keywords
├── researchStatus
├── summary
├── sources[]
├── facts[]
├── confidenceScore
└── completedAt
```

Source document:

```text
research-source
├── researchId
├── url
├── title
├── publisher
├── sourceType
├── publishedAt
├── retrievedAt
└── reliabilityScore
```

Fact document:

```text
research-fact
├── researchId
├── claim
├── sourceIds[]
├── status
├── confidence
└── notes
```

---

# 21. AI Agent Architecture

Do not make one giant AI service.

Agents:

```text
strategist-agent
research-agent
script-agent
fact-check-agent
media-agent
voice-agent
thumbnail-agent
quality-agent
compliance-agent
publishing-agent
analytics-agent
```

Each agent should have:

```text
input
prompt/context
tools
provider
output schema
validation
retry policy
logging
```

---

# 22. AI Provider Abstraction

Do not hard-code one AI provider.

Use interfaces.

```text
AiTextProvider
AiImageProvider
AiVoiceProvider
AiVideoProvider
AiEmbeddingProvider
```

Possible implementations can be:

```text
cloud provider
local model
free-tier provider
future provider
```

Provider credentials must remain server-side.

---

# 23. Prompt Management

Do not hard-code long prompts inside services.

Store versioned prompt templates.

```text
prompt-templates/
├── strategist/
├── research/
├── script/
├── fact-check/
├── quality/
└── compliance/
```

Database should track:

```text
promptId
version
template
model
temperature
maxTokens
createdAt
```

This allows prompt improvement without rewriting business logic.

---

# 24. AI Output Validation

Never trust raw AI output.

Pipeline:

```text
AI
 ↓
JSON/schema validation
 ↓
Business validation
 ↓
Fact validation
 ↓
Quality validation
 ↓
Database
```

Invalid output:

```text
retry
```

Repeated failure:

```text
dead-letter queue
```

---

# 25. n8n Responsibility

Use n8n where it adds value.

Good uses:

- Scheduled trigger
- Webhook intake
- External API orchestration
- Notification workflows
- Google Sheets integration
- Email notifications
- External data ingestion
- Backup workflows
- Operational alerts
- Human approval workflows
- Cross-service automation

Do not move the complete application business logic into n8n.

NestJS remains the source of truth.

---

# 26. n8n Workflows

Recommended workflows:

```text
content-discovery-workflow
research-trigger-workflow
content-production-workflow
approval-workflow
youtube-publishing-workflow
facebook-publishing-workflow
analytics-sync-workflow
daily-strategy-workflow
failed-job-alert-workflow
backup-workflow
token-expiry-workflow
```

---

# 27. Queue Architecture

Use Redis + BullMQ.

Queues:

```text
research
script
fact-check
media
voice
thumbnail
render
quality
compliance
publish
analytics
strategy
notifications
```

Every job should contain:

```text
jobId
workspaceId
contentId
type
attempt
priority
createdAt
```

---

# 28. Job State

```text
queued
processing
completed
failed
retrying
cancelled
dead-letter
```

Frontend must be able to see this state.

---

# 29. Retry Policy

Use exponential backoff for temporary failures.

Retry only when appropriate.

Examples:

```text
network error       → retry
rate limit          → retry
temporary provider  → retry
invalid AI output   → controlled retry
copyright failure   → do not blindly retry
policy failure      → human/strategy review
```

---

# 30. Autonomous Content Pipeline

Full pipeline:

```text
Strategist
    ↓
Topic Candidate
    ↓
Research
    ↓
Source Collection
    ↓
Fact Extraction
    ↓
Fact Verification
    ↓
Script
    ↓
Script Validation
    ↓
Scene Planning
    ↓
Media Collection/Generation
    ↓
Voice
    ↓
Subtitle
    ↓
Video Rendering
    ↓
Thumbnail
    ↓
Quality Check
    ↓
Compliance Check
    ↓
Metadata Preparation
    ↓
Schedule
    ↓
Publish
    ↓
Analytics
    ↓
Performance Analysis
    ↓
Strategy Update
```

---

# 31. Topic Strategy Engine

AI should not randomly create topics.

Maintain:

```text
topic-history
topic-performance
keyword-performance
format-performance
audience-performance
platform-performance
```

AI should detect:

```text
high-performing topics
low-performing topics
overused topics
new opportunities
content gaps
```

---

# 32. Content Diversity Rules

Prevent repetitive content.

Track:

```text
topic similarity
title similarity
script similarity
visual similarity
hook similarity
```

Before generation:

```text
similarity check
```

If too similar:

```text
reject
generate different angle
```

---

# 33. Human Approval

Support three modes:

```text
full-auto
approval-required
hybrid
```

Example:

```text
shorts → auto
long-form → approval
sensitive topics → approval
new format → approval
```

---

# 34. Platform Accounts

Support multiple accounts/pages/channels.

```text
workspace
    ↓
platform-account
    ├── YouTube channel
    ├── Facebook page
    └── future platform
```

Never hard-code a single channel.

---

# 35. OAuth

OAuth credentials:

```text
encrypted at rest
server-side only
refreshable
rotatable
```

Never expose:

```text
accessToken
refreshToken
clientSecret
```

to the browser.

Frontend gets safe account information only.

---

# 36. Publishing Adapter

Use interface:

```text
SocialPublisher
```

Implement:

```text
youtube-publisher
facebook-publisher
```

Future:

```text
instagram-publisher
tiktok-publisher
linkedin-publisher
```

Publishing should be idempotent.

Never publish the same content twice because of a retry.

Store external platform publication IDs.

---

# 37. Scheduling

Store:

```text
timezone
scheduledAt
platform
contentId
status
```

Support:

- fixed time
- best time
- AI selected time
- manual schedule
- recurring schedule

---

# 38. Analytics

Collect platform metrics.

Content-level:

```text
views
likes
comments
shares
watch-time
average-view-duration
retention
click-through-rate
subscribers-gained
followers-gained
```

Platform-level:

```text
followers
subscribers
reach
engagement
watch-time
revenue
```

---

# 39. Analytics Snapshot

Do not overwrite analytics.

Store periodic snapshots.

```text
analytics-snapshot
├── contentId
├── platform
├── capturedAt
├── views
├── likes
├── comments
├── shares
├── watchTime
├── retention
└── followersGained
```

This allows growth graphs.

---

# 40. Analytics Agent

Agent should answer:

```text
Why did this content perform well?

What topics are growing?

What should be created next?

Which formats should be reduced?

Which publishing times perform best?

Which hooks perform best?
```

Recommendations should be stored, not only displayed.

---

# 41. Monetization Module

Show platform-reported data where available.

Track:

```text
eligibility
requirements
current progress
revenue
RPM/CPM where available
monetization products
status
lastCheckedAt
```

Do not hard-code platform eligibility rules as permanent truth.

---

# 42. Metadata Preparation

Content metadata:

```text
title
description
tags
hashtags
category
language
audience
platform settings
disclosure requirements
attribution
```

Generate platform-specific metadata from one canonical content record.

---

# 43. Asset Management

Every asset:

```text
media-assets
├── type
├── mimeType
├── size
├── storageKey
├── source
├── license
├── provider
├── contentId
├── generationJobId
├── checksum
├── width
├── height
├── duration
└── createdAt
```

Use checksum to detect duplicate files.

---

# 44. Storage

Do not store large videos directly inside MongoDB.

MongoDB stores metadata.

Object storage stores:

```text
videos
images
audio
thumbnails
subtitles
render outputs
```

Use lifecycle policies for temporary files.

Example:

```text
temp-render/
```

automatically cleaned after successful publishing.

---

# 45. Media Processing

Use FFmpeg/FFprobe.

Pipeline:

```text
download/read assets
    ↓
validate
    ↓
normalize
    ↓
compose
    ↓
subtitle
    ↓
audio mix
    ↓
encode
    ↓
probe
    ↓
quality check
    ↓
storage
```

Validate:

```text
duration
codec
resolution
fps
audio
file size
```

---

# 46. Subtitle System

Support:

```text
auto subtitles
word timing
sentence timing
language
font
position
safe area
```

Store subtitle source and final rendered version.

---

# 47. Quality Gate

Minimum checks:

```text
video playable
audio exists
audio level acceptable
subtitle readable
thumbnail valid
aspect ratio valid
duration valid
no missing asset
no failed render
```

---

# 48. Compliance Gate

Check:

```text
copyright
asset licensing
reused content risk
misleading claims
sensitive topics
impersonation
spam patterns
platform-specific rules
required AI disclosure
required attribution
```

Failing content should not auto-publish.

---

# 49. Activity Timeline

Every important operation generates an event.

```text
content.created
research.started
research.completed
script.generated
fact-check.failed
render.started
render.completed
quality.failed
content.scheduled
publication.started
publication.completed
publication.failed
analytics.synced
```

Frontend displays this as an activity timeline.

---

# 50. Notifications

Notify owner for:

- Critical failure
- OAuth expiry
- Repeated AI failure
- Publishing failure
- Policy/compliance failure
- Render failure
- Storage failure
- Daily summary
- Monetization milestone

Channels can include:

```text
in-app
email
Telegram/Discord/Slack via n8n
```

---

# 51. Dashboard

Main dashboard:

```text
Today
├── Content generated
├── Published
├── Scheduled
├── Failed
├── Views
├── Engagement
└── Estimated revenue
```

AI summary:

```text
What happened today?
What failed?
What performed best?
What should happen next?
```

---

# 52. Content Library

Filters:

```text
status
platform
content type
niche
date
performance
automation status
```

Views:

```text
grid
table
calendar
```

---

# 53. Content Details Page

Tabs:

```text
Overview
Script
Research
Facts
Media
Video
Thumbnail
Publishing
Analytics
Activity
Versions
```

This page should expose almost everything related to one content item.

---

# 54. Automation Page

Show:

```text
Automation status
Daily content target
Platforms
Publishing mode
Active workflows
Queue health
Worker health
Last run
Next run
Failures
```

Controls:

```text
Pause
Resume
Run now
Retry failed
Change schedule
```

---

# 55. AI Agents Page

Show each agent:

```text
Research Agent
Status: Healthy

Script Agent
Status: Healthy

Fact Check Agent
Status: Healthy

Render Agent
Status: Healthy
```

Metrics:

```text
jobs
success rate
average duration
failure rate
last run
```

---

# 56. Platform Account Page

Show:

```text
connected account
channel/page name
status
token health
last sync
permissions
```

Actions:

```text
Reconnect
Disconnect
Sync
```

---

# 57. System Health

Admin page:

```text
API
MongoDB
Redis
Workers
Media Worker
n8n
Storage
YouTube API
Facebook API
AI providers
```

Status:

```text
healthy
warning
critical
```

---

# 58. Security

Implement:

- Authentication
- Authorization
- Workspace isolation
- RBAC
- Input validation
- Rate limiting
- CSRF protection where applicable
- Secure cookies/tokens
- OAuth token encryption
- Secret management
- Audit logging
- Request logging
- File validation
- MIME validation
- File size limits
- SSRF protection for remote URLs
- URL allow/deny rules
- Webhook signature validation

---

# 59. RBAC

Initial roles:

```text
owner
admin
editor
viewer
```

Permissions:

```text
content.read
content.create
content.update
content.delete
content.publish
automation.manage
platform.manage
analytics.read
settings.manage
```

---

# 60. Workspace Isolation

Every business document must be scoped to:

```text
workspaceId
```

Never allow a user to fetch another workspace's content by changing an ID in the URL.

Authorization must happen server-side.

---

# 61. API Error System

Standard response:

```text
{
  "success": false,
  "error": {
    "code": "CONTENT_NOT_FOUND",
    "message": "Content was not found."
  }
}
```

Use consistent error codes.

Do not expose stack traces in production.

---

# 62. Logging

Structured logs:

```text
timestamp
level
service
module
requestId
jobId
workspaceId
contentId
message
metadata
```

Never log:

```text
password
OAuth tokens
API secrets
refresh tokens
private credentials
```

---

# 63. Audit Log

Store sensitive actions:

```text
login
logout
account-connected
account-disconnected
automation-enabled
automation-disabled
content-published
content-deleted
settings-changed
role-changed
```

---

# 64. Environment Variables

Example categories:

```text
NODE_ENV

MONGODB_URI
REDIS_URL

JWT_SECRET
SESSION_SECRET

YOUTUBE_CLIENT_ID
YOUTUBE_CLIENT_SECRET

META_APP_ID
META_APP_SECRET

STORAGE_ENDPOINT
STORAGE_BUCKET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY

AI_PROVIDER_KEY

N8N_BASE_URL
N8N_WEBHOOK_SECRET
```

Never commit real secrets.

---

# 65. Docker Services

Local development:

```text
web
api
worker
media-worker
mongodb
redis
n8n
```

Optional:

```text
minio
nginx
```

MinIO can provide S3-compatible local object storage.

---

# 66. Local Development Flow

```text
pnpm install
pnpm dev
```

Docker starts:

```text
MongoDB
Redis
n8n
MinIO
```

Applications run:

```text
web
api
worker
media-worker
```

---

# 67. CI/CD

GitHub Actions:

```text
pull-request.yml
ci.yml
build.yml
test.yml
lint.yml
type-check.yml
security.yml
deploy.yml
```

Every PR:

```text
lint
type-check
unit-test
integration-test
build
```

---

# 68. Testing

Frontend:

```text
component tests
hook tests
Redux tests
RTK Query tests
```

Backend:

```text
unit tests
service tests
controller tests
repository tests
integration tests
```

Workers:

```text
job tests
retry tests
failure tests
provider tests
```

Critical pipeline:

```text
research
→ script
→ fact-check
→ render
→ publish
```

must have integration coverage.

---

# 69. Provider Mocking

Do not call real AI/social APIs in normal tests.

Use:

```text
mock-ai-provider
mock-youtube-provider
mock-facebook-provider
mock-storage-provider
```

This keeps tests fast and free.

---

# 70. API Contract

Keep shared API types in:

```text
packages/types
```

If API evolves:

```text
v1
v2
```

Avoid breaking frontend unexpectedly.

---

# 71. Pagination

All large lists must be paginated:

```text
content
research
activity
analytics
jobs
assets
```

Use cursor pagination where appropriate for large datasets.

---

# 72. Search

Content search:

```text
title
description
topic
tags
```

Future:

```text
semantic search
```

using embeddings.

---

# 73. Duplicate Detection

Before creating content:

```text
topic similarity
title similarity
script similarity
asset checksum
```

Reject duplicates or ask AI for a different angle.

---

# 74. Cost Control

Every AI job should track:

```text
provider
model
input tokens
output tokens
estimated cost
duration
```

Even if using free providers.

Dashboard:

```text
AI usage today
AI usage this month
render time
storage usage
API usage
```

---

# 75. Free-First Strategy

Build provider abstraction so the system can use:

```text
free tier
local model
self-hosted service
paid provider
```

without rewriting the application.

Do not architect the application around one vendor.

---

# 76. Rate Limits

Each provider adapter should know:

```text
rate limit
retry-after
quota
daily usage
```

Queue should slow down automatically when limits are reached.

---

# 77. AI Context Management

Do not send entire database documents to the AI.

Build context:

```text
topic
relevant sources
verified facts
audience
content strategy
previous performance
style rules
platform rules
```

Only send relevant context.

---

# 78. Content Style Profile

Workspace settings:

```text
language
tone
audience
niche
content length
hook style
CTA style
visual style
voice
posting frequency
```

AI agents use this profile.

---

# 79. Brand Kit

Workspace can define:

```text
brand name
logo
font
primary color
secondary color
watermark
thumbnail style
intro
outro
CTA
```

Video and thumbnail workers use these settings.

---

# 80. Content Templates

Support reusable templates:

```text
youtube-long-form
youtube-short
facebook-reel
facebook-video
```

Each template defines:

```text
aspect ratio
duration
caption style
intro
outro
thumbnail format
metadata rules
```

---

# 81. Multi-Format Repurposing

One long-form content can create:

```text
1 YouTube long video
3–5 Shorts
3–5 Facebook Reels
1 Facebook post
```

But every derivative must be meaningfully adapted to the platform.

---

# 82. Platform-Specific Adaptation

Do not simply copy the same video everywhere.

AI creates:

```text
YouTube version
Facebook version
Shorts version
Reels version
```

with platform-specific:

```text
hook
duration
caption
title
description
CTA
```

---

# 83. Comment/Community System — Future

Later add:

```text
comments
sentiment
frequent questions
FAQ generation
community posts
```

AI can identify useful audience questions.

Do not auto-reply blindly.

Support approval/rules.

---

# 84. Human-in-the-Loop Safety

Some operations should always support approval:

```text
sensitive topic
political content
medical claims
financial claims
legal claims
controversial claims
copyright uncertainty
policy uncertainty
```

The system should be configurable rather than assuming every category is safe for autonomous publishing.

---

# 85. Data Retention

Define retention:

```text
temporary render files → short retention
job logs → configurable
analytics → long retention
audit logs → long retention
published content metadata → long retention
source/license records → long retention
```

Do not keep unnecessary temporary files forever.

---

# 86. Backup

Backup:

```text
MongoDB
configuration
prompt templates
workspace settings
content metadata
audit logs
```

Large media files should use object-storage replication/versioning rather than MongoDB backup.

---

# 87. Recovery

Document:

```text
MongoDB restore
Redis rebuild
worker restart
n8n restore
OAuth reconnect
storage restore
failed job replay
```

---

# 88. Disaster Handling

If:

```text
AI provider down
```

then:

```text
pause AI jobs
retry later
```

If:

```text
YouTube API down
```

then:

```text
keep scheduled content
retry publishing
```

If:

```text
media worker down
```

then:

```text
jobs remain queued
```

No content should be silently lost.

---

# 89. Event-Driven Architecture

Important domain events:

```text
content-created
research-completed
script-created
fact-check-completed
render-completed
quality-approved
compliance-approved
content-scheduled
content-published
analytics-updated
strategy-updated
```

Events trigger next jobs.

---

# 90. Idempotency

Every external operation must be idempotent.

Example:

```text
publish-content
```

checks:

```text
alreadyPublished?
externalPublicationId?
```

before publishing.

This prevents duplicate posts during retries.

---

# 91. API Security for n8n

n8n webhooks must use:

```text
secret header
signature
timestamp
request validation
```

Never expose an unrestricted internal webhook.

---

# 92. n8n vs NestJS Rule

## NestJS owns:

- Business logic
- Database
- Authentication
- Authorization
- Job creation
- AI orchestration
- Domain rules
- Platform adapters

## n8n owns:

- External workflow orchestration
- Notifications
- Scheduled triggers
- Cross-platform utility automation
- Simple integrations
- Operational workflows

This boundary prevents the system from becoming an unmaintainable collection of n8n nodes.

---

# 93. Development Phases

## Phase 0 — Foundation

```text
monorepo
pnpm
TypeScript
ESLint
Prettier
Git
Docker
environment setup
CI
```

## Phase 1 — Authentication

```text
users
auth
sessions
workspace
RBAC
```

## Phase 2 — Dashboard

```text
layout
sidebar
header
theme
dashboard cards
activity
```

## Phase 3 — Content Core

```text
content
content versions
content library
content details
filters
search
```

## Phase 4 — Research

```text
research agent
sources
facts
verification
```

## Phase 5 — Script

```text
script agent
prompt versioning
script versions
fact validation
```

## Phase 6 — Media

```text
asset library
voice
thumbnail
subtitle
```

## Phase 7 — Rendering

```text
media worker
FFmpeg
render queue
quality validation
```

## Phase 8 — YouTube

```text
OAuth
channel
upload
schedule
analytics
```

## Phase 9 — Facebook

```text
OAuth
page
upload
schedule
analytics
```

## Phase 10 — Automation

```text
BullMQ
n8n
scheduler
retry
events
```

## Phase 11 — Analytics

```text
snapshots
charts
AI analysis
strategy
```

## Phase 12 — Autonomous Mode

```text
strategist
automatic topic selection
automatic production
automatic publishing
automatic optimization
```

---

# 94. MVP Scope

Do not build everything before the first working content.

MVP:

```text
Authentication
Workspace
Dashboard
Content Library
Research Agent
Script Agent
Fact Check
Media Asset
Voice
FFmpeg
YouTube
Facebook
Scheduler
Basic Analytics
Job Queue
Activity Log
```

After this is stable, add:

```text
AI strategy loop
advanced analytics
monetization
multi-workspace
advanced compliance
cost analytics
```

---

# 95. Definition of Done — Feature

A feature is not complete until:

```text
[ ] UI implemented
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Validation
[ ] API integration
[ ] Authorization
[ ] Database handling
[ ] Logging
[ ] Tests
[ ] Responsive UI
[ ] Accessibility
[ ] Type safety
[ ] Documentation
```

---

# 96. Definition of Done — AI Agent

```text
[ ] Input schema
[ ] Output schema
[ ] Prompt version
[ ] Provider abstraction
[ ] Validation
[ ] Retry
[ ] Timeout
[ ] Logging
[ ] Cost tracking
[ ] Failure handling
[ ] Test mock
[ ] Audit trail
```

---

# 97. Definition of Done — Publishing

```text
[ ] OAuth
[ ] Token encryption
[ ] Permission validation
[ ] Metadata validation
[ ] Compliance check
[ ] Idempotency
[ ] Retry
[ ] External ID storage
[ ] Publication status
[ ] Error logging
[ ] Analytics sync
```

---

# 98. Coding Rules

1. Never write unnecessary code.
2. Never duplicate business logic.
3. Never put secrets in source code.
4. Never use `any` without justification.
5. Never trust AI output without validation.
6. Never publish unverified factual claims.
7. Never publish unknown-license assets.
8. Never call external APIs directly from random components.
9. Never put long-running jobs in HTTP request handlers.
10. Never put all business logic into n8n.
11. Never create giant services.
12. Never create giant React components.
13. Use meaningful names.
14. Prefer explicit code over clever code.
15. Keep functions small.
16. Keep modules cohesive.
17. Keep interfaces stable.
18. Add tests for business-critical logic.
19. Log failures with context.
20. Keep internal provenance even when cleaning public technical metadata.

---

# 99. Folder Naming Rules

Always:

```text
content-library
content-details
research-agent
platform-accounts
analytics-dashboard
```

Never:

```text
ContentLibrary
content_library
contentLibrary
```

Files also use kebab-case:

```text
content-card.tsx
content-api.ts
research-agent.service.ts
create-content.dto.ts
```

---

# 100. Git Strategy

Branches:

```text
main
develop
feature/*
fix/*
refactor/*
chore/*
```

Commit style:

```text
feat: add content library
fix: handle failed publishing job
refactor: simplify research service
chore: update dependencies
test: add publishing tests
```

---

# 101. Documentation

Maintain:

```text
docs/
├── architecture/
│   ├── overview.md
│   ├── ai-pipeline.md
│   ├── queue-architecture.md
│   └── publishing-architecture.md
│
├── database/
│   ├── collections.md
│   └── indexes.md
│
├── workflows/
│   ├── content-production.md
│   └── publishing.md
│
└── decisions/
    ├── adr-001-mongodb.md
    ├── adr-002-redux.md
    └── adr-003-n8n-boundary.md
```

---

# 102. Project Progress Tracking

Keep:

```text
PLAN.md
PROGRESS.md
CHANGELOG.md
```

`PLAN.md` = architecture and requirements.

`PROGRESS.md` = current implementation state.

`CHANGELOG.md` = completed releases/changes.

After every meaningful feature:

```text
PROGRESS.md
```

must be updated.

---

# 103. Development Workflow

For every feature:

```text
1. Read PLAN.md
2. Read relevant feature docs
3. Inspect existing implementation
4. Define smallest change
5. Implement backend
6. Implement API contract
7. Implement RTK Query
8. Implement UI
9. Add loading/error/empty states
10. Add tests
11. Run lint
12. Run type-check
13. Run tests
14. Update PROGRESS.md
```

Do not rewrite working modules unnecessarily.

---

# 104. Final System Architecture

```text
                         ┌───────────────────────┐
                         │       NEXT.JS         │
                         │   shadcn + Redux      │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │       NESTJS API      │
                         │  Auth / Domain / API  │
                         └───────┬───────┬───────┘
                                 │       │
                    ┌────────────┘       └────────────┐
                    ▼                                 ▼
              ┌───────────┐                     ┌───────────┐
              │  MongoDB  │                     │   Redis   │
              └───────────┘                     └─────┬─────┘
                                                     │
                                              ┌──────▼──────┐
                                              │   BullMQ    │
                                              └──────┬──────┘
                                                     │
                           ┌─────────────────────────┼─────────────────────────┐
                           ▼                         ▼                         ▼
                    Research Worker            AI Worker               Media Worker
                           │                         │                         │
                           ▼                         ▼                         ▼
                      Research                 AI Providers                 FFmpeg
                           │                         │                         │
                           └─────────────────────────┼─────────────────────────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │ Object Store │
                                              └──────────────┘

                    ┌──────────────────────────────────────────┐
                    │                    n8n                   │
                    │ External workflows / triggers / alerts  │
                    └───────────────────┬──────────────────────┘
                                        │
                       ┌────────────────┼────────────────┐
                       ▼                ▼                ▼
                    YouTube          Facebook         Notifications

                                      │
                                      ▼
                               Analytics Sync
                                      │
                                      ▼
                               Strategy Agent
                                      │
                                      ▼
                              NEXT CONTENT PLAN
```

---

# 105. Final Autonomous Loop

```text
DISCOVER
   ↓
RESEARCH
   ↓
VERIFY
   ↓
WRITE
   ↓
PRODUCE
   ↓
QUALITY CHECK
   ↓
COMPLIANCE CHECK
   ↓
PUBLISH
   ↓
MEASURE
   ↓
LEARN
   ↓
OPTIMIZE
   ↓
DISCOVER AGAIN
```

The platform should eventually run this loop continuously without requiring manual content creation.

---

# 106. Final Success Criteria

The project is considered successful when the owner can:

```text
[ ] Create a workspace
[ ] Connect YouTube
[ ] Connect Facebook
[ ] Set niche
[ ] Set language
[ ] Set audience
[ ] Set daily content target
[ ] Select automation mode
[ ] Enable autonomous operation
```

Then the system can:

```text
[ ] Find topics
[ ] Research topics
[ ] Verify facts
[ ] Generate original scripts
[ ] Generate permitted media
[ ] Generate voice
[ ] Render videos
[ ] Generate thumbnails
[ ] Validate content
[ ] Prepare compliant metadata
[ ] Schedule content
[ ] Publish content
[ ] Collect analytics
[ ] Analyze performance
[ ] Improve future strategy
[ ] Retry failures
[ ] Notify owner about critical issues
[ ] Show everything from the frontend
```

---

# 107. Non-Negotiable Architecture Rules

1. **MongoDB is the primary application database.**
2. **NestJS owns backend business logic.**
3. **Next.js owns the frontend.**
4. **Redux Toolkit + RTK Query owns frontend state/API caching.**
5. **shadcn/ui owns the base UI component system.**
6. **Base UI is preferred for new shadcn/ui initialization unless a deliberate decision chooses another base.**
7. **BullMQ + Redis handles long-running asynchronous jobs.**
8. **n8n handles external workflow automation, not core domain logic.**
9. **FFmpeg runs inside a dedicated media worker.**
10. **AI providers are accessed through provider interfaces.**
11. **Social platforms are accessed through publisher adapters.**
12. **Large media files never live inside MongoDB.**
13. **Every important AI artifact is versioned.**
14. **Every external publication is idempotent.**
15. **Every important operation is auditable.**
16. **Every AI output is validated before use.**
17. **Every factual content pipeline has a verification stage.**
18. **Every publish pipeline has a compliance stage.**
19. **Required platform disclosures/attributions are never bypassed.**
20. **Unnecessary public technical metadata may be sanitized while internal provenance is preserved.**
21. **No production secret is committed to Git.**
22. **No large job runs inside an HTTP request.**
23. **No giant React component.**
24. **No giant NestJS service.**
25. **No duplicated business logic.**
26. **No uncontrolled AI-generated content is automatically published when it fails validation.**
27. **All file and folder names use kebab-case.**
28. **All important work must be reflected in `PROGRESS.md`.**
29. **Every feature must include loading, empty, error, validation, and responsive states.**
30. **The architecture must remain extensible for future platforms and future AI providers.**

---

# 108. Recommended First Build

Do not start with the autonomous AI.

Start with this exact order:

```text
MONOREPO
   ↓
NEXT.JS + SHADCN
   ↓
REDUX + RTK QUERY
   ↓
NESTJS
   ↓
MONGODB
   ↓
AUTH + WORKSPACE
   ↓
CONTENT CRUD
   ↓
DASHBOARD
   ↓
REDIS + BULLMQ
   ↓
RESEARCH AGENT
   ↓
SCRIPT AGENT
   ↓
FACT CHECK
   ↓
MEDIA WORKER
   ↓
FFMPEG
   ↓
YOUTUBE
   ↓
FACEBOOK
   ↓
N8N
   ↓
ANALYTICS
   ↓
STRATEGY AGENT
   ↓
FULL AUTONOMOUS MODE
```

This order minimizes rework and gives you a working vertical slice early instead of spending weeks building disconnected modules.

---

# 109. First Milestone

The first real milestone should be:

> **“One topic entered → complete content generated → quality/compliance checked → video produced → published to YouTube/Facebook → publication visible in dashboard.”**

Once that vertical flow works reliably, scale each stage independently.

---

# 110. Version Policy

At project initialization:

- Use the latest stable compatible versions.
- Prefer Active LTS Node.js.
- Pin exact versions in the lockfile.
- Do not blindly upgrade every package after development starts.
- Apply security updates promptly.
- Review major-version upgrades separately.
- Record major architectural dependency decisions in ADRs.

Current official Next.js information shows Next.js 16.3 available in August 2026, while shadcn/ui currently defaults new projects to Base UI. Re-check official release notes at implementation time before locking the exact dependency versions.

---

# 111. Final Product Definition

This is **not** simply:

```text
AI Video Generator
```

It is:

```text
AI Content Operations Platform
```

with six major layers:

```text
1. CONTENT INTELLIGENCE
2. CONTENT PRODUCTION
3. MEDIA ENGINE
4. PUBLISHING ENGINE
5. ANALYTICS ENGINE
6. AUTONOMOUS STRATEGY ENGINE
```

The frontend is the control center.

NestJS is the application brain.

MongoDB is the persistent source of truth.

Redis/BullMQ is the execution backbone.

n8n is the external automation layer.

AI agents perform specialized cognitive work.

Workers perform long-running jobs.

FFmpeg performs media rendering.

YouTube/Facebook adapters perform publication.

Analytics feeds the strategy engine.

The strategy engine feeds the next content cycle.

That creates the complete autonomous loop:

```text
PLAN → CREATE → VERIFY → PRODUCE → PUBLISH → MEASURE → LEARN → PLAN
```
