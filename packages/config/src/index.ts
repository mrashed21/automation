// Shared application constants and configuration types

/** API version prefix */
export const API_VERSION = "v1" as const;

/** API base path */
export const API_BASE_PATH = `/api/${API_VERSION}` as const;

/** Queue names matching BullMQ configuration */
export const QUEUE_NAMES = {
  RESEARCH: "research",
  SCRIPT: "script",
  FACT_CHECK: "fact-check",
  MEDIA: "media",
  VOICE: "voice",
  THUMBNAIL: "thumbnail",
  RENDER: "render",
  QUALITY: "quality",
  COMPLIANCE: "compliance",
  PUBLISH: "publish",
  ANALYTICS: "analytics",
  STRATEGY: "strategy",
  NOTIFICATIONS: "notifications",
} as const;

/** Supported platform types */
export const PLATFORM_TYPES = {
  YOUTUBE: "youtube",
  FACEBOOK: "facebook",
} as const;

/** Content status values */
export const CONTENT_STATUS = {
  DRAFT: "draft",
  RESEARCHING: "researching",
  SCRIPTING: "scripting",
  FACT_CHECKING: "fact-checking",
  MEDIA_SOURCING: "media-sourcing",
  VOICE_GENERATING: "voice-generating",
  RENDERING: "rendering",
  QUALITY_CHECK: "quality-check",
  COMPLIANCE_CHECK: "compliance-check",
  READY: "ready",
  SCHEDULED: "scheduled",
  PUBLISHING: "publishing",
  PUBLISHED: "published",
  FAILED: "failed",
  ARCHIVED: "archived",
} as const;

/** Default pagination limits */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** Job retry configuration */
export const JOB_RETRY = {
  MAX_ATTEMPTS: 3,
  BACKOFF_TYPE: "exponential" as const,
  BACKOFF_DELAY_MS: 5000,
} as const;
