import { z } from "zod";

export const publishingPlatformSchema = z.enum([
  "youtube",
  "facebook",
  "instagram",
  "tiktok",
]);

export const publicationPrivacySchema = z.enum(["public", "unlisted", "private"]);

export const connectSocialAccountSchema = z.object({
  platform: publishingPlatformSchema,
  authCode: z.string().min(1, "Authorization code is required"),
  accountName: z.string().min(1, "Account name is required"),
  redirectUri: z.string().url().optional(),
});

export type ConnectSocialAccountInput = z.infer<typeof connectSocialAccountSchema>;

export const createPublicationSchema = z.object({
  platform: publishingPlatformSchema.default("youtube"),
  socialAccountId: z.string().min(1, "Connected account selection is required"),
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(5000, "Description cannot exceed 5000 characters").default("").optional(),
  tags: z.array(z.string()).default([]).optional(),
  privacyStatus: publicationPrivacySchema.default("public").optional(),
  category: z.string().default("28").optional(), // Science & Technology
  scheduledAt: z.string().datetime().optional().nullable(),
  publishNow: z.boolean().default(true).optional(),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
