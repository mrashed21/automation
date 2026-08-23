import type { AutomationMode } from "./content.types";
import type { Nullable } from "./common.types";

/** RBAC roles per plan.md section 59 */
export type WorkspaceMemberRole = "owner" | "admin" | "editor" | "viewer";

/** Safe workspace data */
export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  niche: Nullable<string>;
  language: string;
  automationMode: AutomationMode;
  dailyContentTarget: number;
  isAutomationEnabled: boolean;
  createdAt: string;
}

/** Safe user data (no password hash) */
export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: Nullable<string>;
  createdAt: string;
}

/** Workspace member with role */
export interface WorkspaceMemberDto {
  id: string;
  workspaceId: string;
  userId: string;
  user: UserDto;
  role: WorkspaceMemberRole;
  joinedAt: string;
}
