import type { Nullable } from "./common.types";
import type { PlatformType } from "./platform.types";

/** Analytics snapshot for a content item on a specific platform */
export interface AnalyticsSnapshotDto {
  id: string;
  contentId: string;
  platform: PlatformType;
  capturedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeSeconds: Nullable<number>;
  averageViewDurationSeconds: Nullable<number>;
  retentionPercent: Nullable<number>;
  clickThroughRate: Nullable<number>;
  subscribersGained: Nullable<number>;
  followersGained: Nullable<number>;
}

/** Platform-level analytics (channel/page level) */
export interface PlatformAnalyticsDto {
  platform: PlatformType;
  platformAccountId: string;
  capturedAt: string;
  followers: Nullable<number>;
  subscribers: Nullable<number>;
  totalViews: Nullable<number>;
  totalWatchTimeSeconds: Nullable<number>;
  estimatedRevenueUsd: Nullable<number>;
}
