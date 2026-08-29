import { z } from "zod";

export const autoDiscoverTopicsSchema = z.object({
  niche: z.string().optional(),
  format: z.enum(["shorts", "long-form", "any"]).default("any"),
  count: z.number().int().min(1).max(10).default(5),
  creativity: z.enum(["safe", "balanced", "breakthrough"]).default("balanced"),
});

export const produceOpportunitySchema = z.object({
  targetFormat: z.enum(["shorts", "long-form"]).optional(),
  customPromptOverrides: z.string().optional(),
});

export const checkTopicDiversitySchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  threshold: z.number().min(0.1).max(1.0).default(0.7),
});

export type AutoDiscoverTopicsInput = z.infer<typeof autoDiscoverTopicsSchema>;
export type ProduceOpportunityInput = z.infer<typeof produceOpportunitySchema>;
export type CheckTopicDiversityInput = z.infer<typeof checkTopicDiversitySchema>;
