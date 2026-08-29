import { z } from "zod";

export const mediaTypeSchema = z.enum([
  "image",
  "audio",
  "video",
  "thumbnail",
  "subtitle",
  "document",
]);

export const mediaSourceSchema = z.enum([
  "ai_generated",
  "uploaded",
  "stock",
  "rendered",
]);

export const generatePresignedUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  type: mediaTypeSchema,
  contentId: z.string().optional(),
  sizeBytes: z.number().positive("Size must be greater than 0"),
});

export type GeneratePresignedUrlInput = z.infer<typeof generatePresignedUrlSchema>;

export const registerMediaAssetSchema = z.object({
  contentId: z.string().optional(),
  type: mediaTypeSchema,
  title: z.string().min(1, "Title is required"),
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  sizeBytes: z.number().positive(),
  storageKey: z.string().min(1, "Storage key is required"),
  url: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().url().optional(),
  source: mediaSourceSchema.default("uploaded"),
  license: z.string().default("Owner Reserved / Internal Asset"),
  provider: z.string().default("manual-upload"),
  checksum: z.string().min(1, "Checksum is required"),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  durationSeconds: z.number().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RegisterMediaAssetInput = z.infer<typeof registerMediaAssetSchema>;

export const generateVoiceNarrationSchema = z.object({
  voiceId: z.string().default("21m00Tcm4TlvDq8ikWAM"), // Rachel / Standard Narrator
  voiceName: z.string().default("Rachel — Professional Narrator"),
  provider: z.enum(["elevenlabs", "tts", "mock"]).default("elevenlabs"),
  customScriptText: z.string().optional(),
  stability: z.number().min(0).max(1).default(0.75),
  similarityBoost: z.number().min(0).max(1).default(0.75),
});

export type GenerateVoiceNarrationInput = z.infer<typeof generateVoiceNarrationSchema>;

export const generateThumbnailVariantsSchema = z.object({
  style: z
    .enum(["modern_vibrant", "dramatic_cinematic", "minimal_sleek", "youtube_high_ctr"])
    .default("youtube_high_ctr"),
  headlineText: z.string().max(60, "Headline overlay text too long").optional(),
  customPrompt: z.string().optional(),
  variantCount: z.number().min(1).max(4).default(3),
});

export type GenerateThumbnailVariantsInput = z.infer<typeof generateThumbnailVariantsSchema>;

export const selectPrimaryThumbnailSchema = z.object({
  thumbnailAssetId: z.string().min(1, "Thumbnail asset ID is required"),
});

export type SelectPrimaryThumbnailInput = z.infer<typeof selectPrimaryThumbnailSchema>;

export const startRenderJobSchema = z.object({
  aspectRatio: z.enum(["16:9", "9:16"]).default("16:9"),
  resolution: z.enum(["1080p", "720p"]).default("1080p"),
  includeSubtitles: z.boolean().default(true),
  subtitleStyle: z
    .enum(["highlight_pop", "classic_box", "subtle_clean"])
    .default("highlight_pop"),
  includeMusic: z.boolean().default(true),
  musicVolume: z.number().min(0).max(1).default(0.15),
});

export type StartRenderJobInput = z.infer<typeof startRenderJobSchema>;

