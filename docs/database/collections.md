# Database Collections Reference

MongoDB is the primary persistent data store for the AI Content Operations Platform. Large binary files are stored in object storage (MinIO / S3), with URLs and metadata stored in MongoDB.

---

## Registered Collections

| Collection Name | Schema File | Description |
| --- | --- | --- |
| `users` | `user.schema.ts` | System user profiles, passwords (bcrypt), and roles |
| `refresh-tokens` | `refresh-token.schema.ts` | Hashed JWT refresh tokens with TTL expiration |
| `workspaces` | `workspace.schema.ts` | Tenant workspaces, automation modes, quota limits |
| `workspace-members` | `workspace-member.schema.ts` | Workspace membership and RBAC permissions |
| `content` | `content.schema.ts` | Central content entity tracking 15 lifecycle states |
| `content-versions` | `content-version.schema.ts` | Immutable snapshot audit log of content revisions |
| `researches` | `research.schema.ts` | Autonomous research session dossiers |
| `research-sources` | `research-source.schema.ts` | Retrieved web articles, authority ratings, source links |
| `research-facts` | `research-fact.schema.ts` | Extracted fact claims and verification statuses |
| `scripts` | `script.schema.ts` | Multi-section production scripts with visual timings |
| `script-versions` | `script-version.schema.ts` | Immutable script revision snapshots |
| `media-assets` | `media-asset.schema.ts` | Audio, video clips, and B-roll metadata in storage |
| `thumbnail-assets` | `thumbnail-asset.schema.ts` | A/B thumbnail image variants and preview URLs |
| `voice-assets` | `voice-asset.schema.ts` | Neural text-to-speech narration audio metadata |
| `social-accounts` | `social-account.schema.ts` | Connected YouTube & Facebook channel OAuth credentials |
| `publications` | `publication.schema.ts` | Published video records, external IDs, and live URLs |
| `automation-rules` | `automation-rule.schema.ts` | Scheduled cron, webhook, and manual pipeline trigger rules |
| `automation-runs` | `automation-run.schema.ts` | Automation execution runs with embedded pipeline stage logs |
| `analytics-snapshots` | `analytics-snapshot.schema.ts` | Multi-platform performance time-series snapshots |
| `strategy-recommendations` | `strategy-recommendation.schema.ts` | Autonomous strategist topic candidates and scores |
