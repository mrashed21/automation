import { SetMetadata } from "@nestjs/common";
import type { WorkspaceMemberRole } from "@repo/types";

export const ROLES_KEY = "roles";
export const Roles = (...roles: WorkspaceMemberRole[]) => SetMetadata(ROLES_KEY, roles);
