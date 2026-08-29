# Social Publishing Workflow

The publishing engine orchestrates instantaneous or scheduled publication across YouTube and Meta Facebook.

---

## 1. Publishing Process Flow

```text
Content Marked "Ready"
      ↓
Target Platform Selected (YouTube / Facebook)
      ↓
Metadata Preparation (Title, Description, Tags, Playlist, #Shorts)
      ↓
Compliance & Synthetic Media Disclosures Flagged
      ↓
Idempotent Queue Job Dispatched
      ↓
Worker Executes Adapter (YouTube Data API v3 / Facebook Graph API)
      ↓
External Publication ID & Live URL Saved to MongoDB
      ↓
Analytics Tracking Loop Initiated
```

---

## 2. Automation Modes

- **Full Auto (`full-auto`)**: Pipeline completes rendering, runs compliance check, and publishes immediately.
- **Approval Required (`approval-required`)**: Pipeline pauses at `ready` state, awaiting manual user sign-off in the Publishing Tab.
- **Hybrid (`hybrid`)**: Standard formats (Shorts) publish automatically; Long-form formats pause for review.
