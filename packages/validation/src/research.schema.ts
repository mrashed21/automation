import { z } from "zod";

export const generateResearchSchema = z.object({
  focusKeywords: z.array(z.string().min(1).max(50)).optional(),
  depth: z.enum(["standard", "deep", "fast"]).default("standard"),
  niche: z.string().max(100).optional(),
});

export type GenerateResearchInput = z.infer<typeof generateResearchSchema>;

export const verifyFactSchema = z.object({
  status: z.enum(["verified", "unverified", "disputed", "rejected"]),
  confidence: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export type VerifyFactInput = z.infer<typeof verifyFactSchema>;

export const researchSourceSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  title: z.string().min(1, "Title is required").max(300),
  publisher: z.string().min(1, "Publisher is required").max(150),
  sourceType: z.enum(["news", "academic", "official", "industry", "encyclopedia", "other"]),
  publishedAt: z.string().nullable().optional(),
  reliabilityScore: z.number().min(0).max(100),
});

export const researchFactSchema = z.object({
  claim: z.string().min(5, "Claim must be at least 5 characters").max(500),
  sourceIds: z.array(z.string()).default([]),
  status: z.enum(["verified", "unverified", "disputed", "rejected"]).default("unverified"),
  confidence: z.number().min(0).max(100).default(80),
  notes: z.string().max(1000).nullable().optional(),
});

export const researchOutputValidationSchema = z.object({
  topic: z.string().min(1),
  keywords: z.array(z.string()),
  summary: z.string().min(20),
  keyInsights: z.array(z.string()).min(1),
  confidenceScore: z.number().min(0).max(100),
  sources: z.array(researchSourceSchema).min(1),
  facts: z.array(researchFactSchema).min(1),
});

export type ResearchOutputValidation = z.infer<typeof researchOutputValidationSchema>;
