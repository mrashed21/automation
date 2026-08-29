import { z } from "zod";

/** Schema for creating a new automation rule */
export const createAutomationRuleSchema = z.object({
  name: z.string().min(2).max(120),
  trigger: z.enum(["cron", "webhook", "manual"]),
  cronExpression: z.string().nullable().optional(),
  platforms: z.array(z.string()).min(1, "At least one platform required"),
  dailyTarget: z.number().int().min(1).max(20).default(1),
  approvalMode: z
    .enum(["full-auto", "approval-required", "hybrid"])
    .default("full-auto"),
});

/** Schema for updating an existing automation rule */
export const updateAutomationRuleSchema = createAutomationRuleSchema
  .partial()
  .extend({
    isEnabled: z.boolean().optional(),
  });

/** Schema for toggling rule enabled state */
export const toggleAutomationRuleSchema = z.object({
  isEnabled: z.boolean(),
});

export type CreateAutomationRuleDto = z.infer<typeof createAutomationRuleSchema>;
export type UpdateAutomationRuleDto = z.infer<typeof updateAutomationRuleSchema>;
export type ToggleAutomationRuleDto = z.infer<typeof toggleAutomationRuleSchema>;
