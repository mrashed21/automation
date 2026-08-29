# Content Production Workflow

The content production lifecycle transitions items through 15 status states from initial creation to multi-platform publication.

---

## 1. Lifecycle State Machine

```text
draft
  ↓
researching → researching completed
  ↓
scripting → scripting completed
  ↓
fact-checking → fact-checking passed
  ↓
media-sourcing → media assets ready
  ↓
voice-generating → narration audio ready
  ↓
rendering → FFmpeg timeline composition ready
  ↓
quality-check → automated bitrate/resolution passed
  ↓
compliance-check → AI disclosure & content compliance passed
  ↓
ready
  ↓
scheduled → publishing → published
```

---

## 2. Tabbed Studio Integration

The frontend details view (`/dashboard/content/[id]`) provides 8 specialized studios:
1. **Overview Studio**: Metadata, format toggle (16:9 vs 9:16), pipeline status bar.
2. **Research Studio**: Depth selector, live authority sources, fact claims verification.
3. **Script Studio**: Section-by-section generator, timing pacing meter, version history snapshots.
4. **Media Studio**: ElevenLabs voice generation, audio waveform player, FFmpeg Video Render Studio.
5. **Thumbnail Studio**: AI A/B variant generator with CTR prediction and primary variant selector.
6. **Publishing Studio**: Multi-platform publishing targets, schedule picker, YouTube/Facebook adapters.
7. **Analytics Studio**: Platform breakdown cards, sync trigger, interactive Recharts time-series curves.
8. **Audit & Versions**: Immutable diff viewer across content and script revisions.
