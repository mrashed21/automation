import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { WorkspaceMemberRole } from "@repo/types";
import { ROLES_KEY } from "../decorators/roles.decorator";

const ROLE_HIERARCHY: Record<WorkspaceMemberRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceMemberRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const workspace = request.workspace as { role?: WorkspaceMemberRole };

    if (!workspace || !workspace.role) {
      throw new ForbiddenException("Workspace context missing for role verification");
    }

    const userRoleLevel = ROLE_HIERARCHY[workspace.role] ?? 0;
    const hasPermission = requiredRoles.some((role) => userRoleLevel >= ROLE_HIERARCHY[role]);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Requires one of: [${requiredRoles.join(", ")}]. Current role: ${workspace.role}`,
      );
    }

    return true;
  }
}
