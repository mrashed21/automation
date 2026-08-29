/**
 * Strategy recommendation & opportunity types
 */

export type OpportunityStatus =
  | "suggested"
  | "accepted"
  | "rejected"
  | "in-production"
  | "published";

export interface ContentOpportunityDto {
  id: string;
  workspaceId: string;
  topic: string;
  rationale: string;
  suggestedHooks: string[];
  format: "shorts" | "long-form";
  niche?: string;
  keywords: string[];
  estimatedScore: number; // 0-100 predicted viral/engagement score
  status: OpportunityStatus;
  contentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyInsightDto {
  topHooks: string[];
  recommendedNiches: string[];
  bestPostingHours: { hour: number; dayOfWeek: string; avgViews: number }[];
  suggestedFormatBalance: { shortsPercent: number; longFormPercent: number };
  growthObservations: string[];
  opportunityScore: number; // Overall strategic health 0-100
}

export interface TopicDiversityResultDto {
  isUnique: boolean;
  maxSimilarity: number;
  conflictingTopic?: string | null;
}

export interface AutoDiscoverTopicsInputDto {
  niche?: string;
  format?: "shorts" | "long-form" | "any";
  count?: number; // 1-10
  creativity?: "safe" | "balanced" | "breakthrough";
}
