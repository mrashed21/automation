# Social Publishing Architecture

Per Section 11, 48, and 49 of `plan.md`, social publishing uses provider adapters adhering to strict idempotency, encrypted token management, and platform-specific formatting.

---

## 1. Publisher Adapters

- **YouTube Publisher (`YouTubePublisher`)**:
  - Implements YouTube Data API v3 resumable chunked video uploads.
  - Supports 16:9 Long-Form videos & 9:16 Shorts (`#Shorts` tag + vertical aspect ratio).
  - Handles custom thumbnail attachment, playlist assignment, and synthetic media disclosure flag.
- **Facebook Publisher (`FacebookPublisher`)**:
  - Implements Meta Graph API Video & Reels endpoints (`/page-id/videos`, `/page-id/video_reels`).
  - Supports page-level publishing with thumbnail previews and caption formatting.

---

## 2. Idempotency & Token Security

1. **Idempotency Key**: Generated from `workspaceId:contentId:platform:targetAccountId`. Prevents duplicate publications on worker restarts.
2. **Encrypted Tokens**: OAuth tokens (`access_token`, `refresh_token`) are stored encrypted at rest using AES-256-GCM.
3. **Publication Entity**: Tracks `externalPostId`, `externalPostUrl`, `publishedAt`, `complianceApproved`, and `metrics`.
