import type { Nullable } from "./common.types";

/** Research status lifecycle */
export type ResearchStatus = "pending" | "researching" | "completed" | "failed";

/** Fact verification states */
export type FactVerificationStatus = "verified" | "unverified" | "disputed" | "rejected";

/** Source document metadata */
export interface ResearchSourceDto {
  id: string;
  researchId: string;
  url: string;
  title: string;
  publisher: string;
  sourceType: "news" | "academic" | "official" | "industry" | "encyclopedia" | "other";
  publishedAt: Nullable<string>;
  retrievedAt: string;
  reliabilityScore: number; // 0 - 100
}

/** Verified factual claim extracted from research */
export interface ResearchFactDto {
  id: string;
  researchId: string;
  claim: string;
  sourceIds: string[];
  status: FactVerificationStatus;
  confidence: number; // 0 - 100
  notes: Nullable<string>;
}

/** Aggregated research package for a content topic */
export interface ResearchDto {
  id: string;
  contentId: string;
  workspaceId: string;
  topic: string;
  keywords: string[];
  researchStatus: ResearchStatus;
  summary: string;
  keyInsights: string[];
  confidenceScore: number; // 0 - 100
  sources: ResearchSourceDto[];
  facts: ResearchFactDto[];
  completedAt: Nullable<string>;
  createdAt: string;
  updatedAt: string;
}

/** Input contract for triggering research */
export interface GenerateResearchInput {
  focusKeywords?: string[];
  depth?: "standard" | "deep" | "fast";
  niche?: string;
}

/** Input contract for updating fact status */
export interface VerifyFactInput {
  status: FactVerificationStatus;
  confidence?: number;
  notes?: string;
}
