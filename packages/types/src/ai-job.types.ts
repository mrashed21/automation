import type { JobState, Nullable } from "./common.types";

/** Queue names matching the BullMQ configuration */
export type QueueName =
  | "research"
  | "script"
  | "fact-check"
  | "media"
  | "voice"
  | "thumbnail"
  | "render"
  | "quality"
  | "compliance"
  | "publish"
  | "analytics"
  | "strategy"
  | "notifications";

/** AI provider types matching the provider interface */
export type AiProviderType = "text" | "image" | "voice" | "video" | "embedding";

/** AI job record */
export interface AiJobDto {
  id: string;
  workspaceId: string;
  contentId: Nullable<string>;
  queue: QueueName;
  type: string;
  state: JobState;
  attempt: number;
  priority: number;
  provider: Nullable<string>;
  model: Nullable<string>;
  inputTokens: Nullable<number>;
  outputTokens: Nullable<number>;
  estimatedCostUsd: Nullable<number>;
  durationMs: Nullable<number>;
  error: Nullable<string>;
  createdAt: string;
  completedAt: Nullable<string>;
}
