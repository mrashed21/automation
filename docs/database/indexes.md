# Database Compound & High-Performance Indexes

Per Section 65 of `plan.md`, all high-throughput queries in the application are covered by compound indexes.

---

## High-Performance Index Inventory

### 1. Multi-Tenant Workspace Queries
- `content`: `{ workspaceId: 1, status: 1, createdAt: -1 }`
- `content`: `{ workspaceId: 1, contentType: 1 }`
- `content-versions`: `{ contentId: 1, versionNumber: -1 }`
- `researches`: `{ workspaceId: 1, contentId: 1 }`
- `scripts`: `{ workspaceId: 1, contentId: 1 }`
- `media-assets`: `{ workspaceId: 1, contentId: 1 }`
- `thumbnail-assets`: `{ workspaceId: 1, contentId: 1 }`
- `publications`: `{ workspaceId: 1, contentId: 1, platform: 1 }`

### 2. Automation & Execution Queries
- `automation-rules`: `{ workspaceId: 1, isEnabled: 1 }`
- `automation-runs`: `{ workspaceId: 1, status: 1, startedAt: -1 }`
- `automation-runs`: `{ ruleId: 1, startedAt: -1 }`

### 3. Analytics & Strategist Queries
- `analytics-snapshots`: `{ workspaceId: 1, contentId: 1, timestamp: -1 }`
- `analytics-snapshots`: `{ workspaceId: 1, platform: 1, timestamp: -1 }`
- `strategy-recommendations`: `{ workspaceId: 1, status: 1, createdAt: -1 }`
- `strategy-recommendations`: `{ workspaceId: 1, estimatedScore: -1 }`

### 4. Auth & Security Indexes
- `users`: `{ email: 1 }` (Unique)
- `workspace-members`: `{ workspaceId: 1, userId: 1 }` (Unique compound)
- `refresh-tokens`: `{ userId: 1, tokenHash: 1 }` (Unique compound with TTL expiration)
