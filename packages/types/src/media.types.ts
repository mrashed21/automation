export type MediaType = "image" | "audio" | "video" | "thumbnail" | "subtitle" | "document";

export type MediaSource = "ai_generated" | "uploaded" | "stock" | "rendered";

export interface MediaAssetDto {
  id: string;
  workspaceId: string;
  contentId: string | null;
  type: MediaType;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  url: string;
  thumbnailUrl: string | null;
  source: MediaSource;
  license: string;
  provider: string;
  checksum: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThumbnailAssetDto {
  id: string;
  workspaceId: string;
  contentId: string;
  mediaAssetId: string;
  prompt: string;
  variant: "A" | "B" | "C" | "D";
  headlineText: string;
  style: string;
  ctrScoreEstimate: number;
  status: "generating" | "ready" | "selected" | "rejected";
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceAssetDto {
  id: string;
  workspaceId: string;
  contentId: string;
  scriptId: string;
  mediaAssetId: string;
  voiceId: string;
  voiceName: string;
  provider: string;
  durationSeconds: number;
  sampleRate: number;
  audioFormat: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentMediaPackageDto {
  contentId: string;
  workspaceId: string;
  assets: MediaAssetDto[];
  voice: VoiceAssetDto | null;
  thumbnails: ThumbnailAssetDto[];
  selectedThumbnailId: string | null;
  renderedVideo: MediaAssetDto | null;
}

export interface PresignedUploadUrlDto {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
  expiresInSeconds: number;
  headers?: Record<string, string>;
}
