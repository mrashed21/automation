import { z } from "zod";

const contentTypeEnum = z.enum([
  "youtube-long",
  "youtube-short",
  "facebook-video",
  "facebook-reel",
]);

export const createContentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().max(5000).optional(),
  contentType: contentTypeEnum,
  language: z.string().min(2).max(10).default("en"),
  niche: z.string().max(100).optional(),
  platformAccountIds: z.array(z.string()).optional().default([]),
});

export const updateContentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  niche: z.string().max(100).optional(),
  language: z.string().min(2).max(10).optional(),
  status: z
    .enum([
      "draft",
      "researching",
      "scripting",
      "fact-checking",
      "media-sourcing",
      "voice-generating",
      "rendering",
      "quality-check",
      "compliance-check",
      "ready",
      "scheduled",
      "publishing",
      "published",
      "failed",
      "archived",
    ])
    .optional(),
  changeReason: z.string().max(200).optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
