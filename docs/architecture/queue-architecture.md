# BullMQ Queue & Worker Architecture

Per Section 6, 27, and 28 of `plan.md`, long-running workloads are isolated from the NestJS API server into dedicated background worker processes.

---

## 1. Queue Organization

| Queue Name | Worker Host | Responsibility |
| --- | --- | --- |
| `QUEUE_NAMES.RESEARCH` | `apps/worker` | Research synthesis, web source retrieval |
| `QUEUE_NAMES.SCRIPT` | `apps/worker` | Multi-section script generation & revision snapshots |
| `QUEUE_NAMES.RENDER` | `apps/media-worker` | FFmpeg video timeline composition, audio mixing, ASS subtitles |
| `QUEUE_NAMES.VOICE` | `apps/worker` | ElevenLabs text-to-speech audio synthesis |
| `QUEUE_NAMES.THUMBNAIL` | `apps/worker` | A/B visual thumbnail variant generation |
| `QUEUE_NAMES.PUBLISH` | `apps/worker` | Idempotent YouTube / Facebook video uploads |
| `QUEUE_NAMES.ANALYTICS` | `apps/worker` | Time-series snapshot collection & metrics synchronization |

---

## 2. Job Lifecycle States

```text
queued → processing → completed
          ↓
        failed → retrying (exponential backoff) → dead-letter
```

Each job payload tracks:
- `workspaceId`: Tenant isolation.
- `contentId`: Target content item.
- `jobId`: Distributed trace ID.
- `attempt`: Current retry attempt.
- `progress`: 0-100% incremental progress reporting for UI bars.
