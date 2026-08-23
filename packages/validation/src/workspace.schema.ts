import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(80, "Workspace name must be at most 80 characters"),
  niche: z.string().max(100).optional(),
  language: z.string().min(2).max(10).default("en"),
  dailyContentTarget: z.number().int().min(1).max(20).default(1),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial().extend({
  isAutomationEnabled: z.boolean().optional(),
  automationMode: z.enum(["full-auto", "approval-required", "hybrid"]).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  role: z.enum(["admin", "editor", "viewer"]).default("editor"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
