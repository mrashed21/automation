import type { Nullable } from "./common.types";

/** Supported publishing platforms */
export type PlatformType = "youtube" | "facebook";

/** Platform account connection status */
export type PlatformAccountStatus = "connected" | "disconnected" | "token-expired" | "error";

/** Publication status for a content item on a specific platform */
export type PublicationStatus =
  "pending" | "uploading" | "processing" | "published" | "failed" | "removed";

/** Safe platform account data (never exposes tokens to the frontend) */
export interface PlatformAccountDto {
  id: string;
  workspaceId: string;
  platform: PlatformType;
  accountName: string;
  accountId: string;
  channelOrPageId: Nullable<string>;
  channelOrPageName: Nullable<string>;
  status: PlatformAccountStatus;
  permissions: string[];
  lastSyncAt: Nullable<string>;
  tokenExpiresAt: Nullable<string>;
  createdAt: string;
}

/** Content publication record */
export interface ContentPublicationDto {
  id: string;
  contentId: string;
  platformAccountId: string;
  platform: PlatformType;
  status: PublicationStatus;
  externalPublicationId: Nullable<string>;
  publishedAt: Nullable<string>;
  error: Nullable<string>;
  createdAt: string;
}
