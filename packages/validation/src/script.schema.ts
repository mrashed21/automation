import { z } from "zod";

export const scriptSectionTypeEnum = z.enum([
  "hook",
  "intro",
  "body",
  "climax",
  "call-to-action",
  "outro",
]);

export const scriptToneEnum = z.enum([
  "informative",
  "dramatic",
  "energetic",
  "casual",
  "analytical",
]);

export const scriptSectionSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().min(0),
  type: scriptSectionTypeEnum,
  heading: z.string().min(1, "Heading is required").max(100),
  narration: z.string().min(1, "Narration content is required"),
  visualCue: z.string().max(300).default(""),
  estimatedDurationSeconds: z.number().min(0).default(0),
});

export const generateScriptSchema = z.object({
  tone: scriptToneEnum.default("informative"),
  targetDurationSeconds: z.number().int().min(15).max(3600).default(60),
  customInstructions: z.string().max(1000).optional(),
});

export type GenerateScriptInput = z.infer<typeof generateScriptSchema>;

export const updateScriptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  tone: scriptToneEnum.optional(),
  hook: z.string().min(1).max(500).optional(),
  sections: z.array(scriptSectionSchema).min(1, "At least one section is required"),
  changeReason: z.string().max(200).default("Manual edit"),
});

export type UpdateScriptInput = z.infer<typeof updateScriptSchema>;

export const scriptOutputValidationSchema = z.object({
  title: z.string().min(1),
  hook: z.string().min(10),
  targetDurationSeconds: z.number(),
  tone: scriptToneEnum,
  sections: z.array(scriptSectionSchema).min(2),
});

export type ScriptOutputValidation = z.infer<typeof scriptOutputValidationSchema>;
