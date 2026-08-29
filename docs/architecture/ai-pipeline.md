# AI Autonomous Pipeline Architecture

The platform operates an autonomous end-to-end cognitive content pipeline across 6 specialized stages.

---

## 1. Pipeline Stages

```text
Strategist Agent
      ↓ (Topic Candidate + Rationale + Hooks)
Research Agent
      ↓ (Web Sources + Verified Fact Claims)
Script Agent
      ↓ (Multi-Section Script + Spoken Timings + Visual Cues)
Media Sourcing & Generation
      ↓ (Neural Narration + A/B Thumbnail Variants + B-Roll)
FFmpeg Video Composition
      ↓ (Safe-Zone Subtitles + Audio Ducking -16dB + Video Rendering)
Quality & Compliance Gate
      ↓ (Audio/Video Validation + Copyright & AI Disclosures)
Publishing Engine (YouTube / Facebook)
      ↓ (OAuth Idempotent Video Uploads)
Analytics Sync & Strategist Feedback Loop
```

---

## 2. Agent Specifications

| Agent | Responsibility | Output Schema |
| --- | --- | --- |
| **Strategist Agent** | Opportunity discovery, trend analysis, diversity checking | `ContentOpportunityDto`, `StrategyInsightDto` |
| **Research Agent** | Authority sources synthesis, reliability scoring, verifiable claims | `ResearchDto`, `ResearchSourceDto`, `ResearchFactDto` |
| **Script Agent** | High-retention script generation, section pacing, visual cues | `ScriptDto`, `ScriptSectionDto` |
| **Voice Agent** | ElevenLabs neural voice narration generation | `VoiceAssetDto` |
| **Thumbnail Agent** | A/B thumbnail variant generation & CTR score estimation | `ThumbnailAssetDto` |
| **Quality & Compliance** | Format validation, safe-area subtitle compliance, AI disclosure | `ComplianceStatus` |

---

## 3. Strict Validation & Retry Policy

Per Section 24 & 29 of `plan.md`, no raw AI output is trusted without validation:
- All structured JSON responses are validated against runtime Zod schemas.
- Exponential backoff retry policy (max 3 attempts).
- Fallback content generations if providers encounter transient rate limits.
