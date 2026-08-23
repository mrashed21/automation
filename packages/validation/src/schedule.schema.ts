import { z } from "zod";

export const scheduleContentSchema = z.object({
  platformAccountId: z.string().min(1),
  scheduledAt: z.string().datetime({ message: "Must be a valid ISO 8601 datetime" }),
  timezone: z.string().min(1).default("UTC"),
});

export type ScheduleContentInput = z.infer<typeof scheduleContentSchema>;
