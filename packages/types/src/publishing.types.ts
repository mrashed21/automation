export type PublishingPlatform = "youtube" | "facebook" | "instagram" | "tiktok";

export type SocialPublishingStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";


export type PublicationPrivacy = "public" | "unlisted" | "private";

export interface SocialAccountDto {
  id: string;
  workspaceId: string;
  platform: PublishingPlatform;
  accountName: string;
  accountId: string;
  avatarUrl: string | null;
  isConnected: boolean;
  scopes: string[];
  tokenExpiresAt: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationRecordDto {
  id: string;
  workspaceId: string;
  contentId: string;
  platform: PublishingPlatform;
  socialAccountId: string;
  accountName: string;
  title: string;
  description: string;
  tags: string[];
  privacyStatus: PublicationPrivacy;
  category?: string;
  status: SocialPublishingStatus;
  scheduledAt?: string | null;

  publishedAt?: string | null;
  externalPostId?: string | null;
  externalUrl?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PublishJobPayload {
  publicationId: string;
  workspaceId: string;
  contentId: string;
  platform: PublishingPlatform;
  socialAccountId: string;
  title: string;
  description: string;
  tags: string[];
  privacyStatus: PublicationPrivacy;
  videoAssetUrl: string;
  thumbnailAssetUrl?: string;
}

export interface PublishJobResult {
  publicationId: string;
  externalPostId: string;
  externalUrl: string;
  publishedAt: string;
  status: "published" | "failed";
  errorMessage?: string;
}
