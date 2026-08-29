import type { Nullable } from "./common.types";

/** Supported content types */
export type ContentType = "youtube-long" | "youtube-short" | "facebook-video" | "facebook-reel";

/** Content pipeline status */
export type ContentStatus =
  | "draft"
  | "researching"
  | "scripting"
  | "fact-checking"
  | "media-sourcing"
  | "voice-generating"
  | "rendering"
  | "quality-check"
  | "compliance-check"
  | "ready"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "archived";

/** Compliance check status */
export type ComplianceStatus = "pending" | "approved" | "rejected" | "requires-review";

/** Automation control mode */
export type AutomationMode = "full-auto" | "approval-required" | "hybrid";

/** Shared content type contract (safe for frontend and backend) */
export interface ContentDto {
  id: string;
  workspaceId: string;
  title: string;
  description: Nullable<string>;
  contentType: ContentType;
  language: string;
  niche: Nullable<string>;
  status: ContentStatus;
  currentVersion: number;
  qualityScore: Nullable<number>;
  complianceStatus: ComplianceStatus;
  scheduledAt: Nullable<string>;
  publishedAt: Nullable<string>;
  createdAt: string;
  updatedAt: string;
}

/** Content version contract for history tracking */
export interface ContentVersionDto {
  id: string;
  contentId: string;
  workspaceId: string;
  version: number;
  title: string;
  description: Nullable<string>;
  contentType: ContentType;
  language: string;
  niche: Nullable<string>;
  scriptId: Nullable<string>;
  thumbnailAssetId: Nullable<string>;
  videoAssetId: Nullable<string>;
  changeReason: string;
  source: string;
  createdBy: string;
  createdAt: string;
}

/** Content asset provenance — internal tracking */
export interface AssetProvenance {
  source: string;
  license: string;
  provider: string;
  creator: Nullable<string>;
  generationMethod: string;
  generationJobId: Nullable<string>;
  contentId: string;
  createdAt: string;
}
