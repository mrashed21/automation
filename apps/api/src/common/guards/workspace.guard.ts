import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  WorkspaceMember,
  WorkspaceMemberDocument,
} from "../../database/schemas/workspace-member.schema";
import type { AuthenticatedUser } from "@repo/types";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    @InjectModel(WorkspaceMember.name)
    private workspaceMemberModel: Model<WorkspaceMemberDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user || !user.userId) {
      throw new ForbiddenException("User must be authenticated to access workspace resources");
    }

    const workspaceId =
      request.headers["x-workspace-id"] ||
      request.query["workspaceId"] ||
      request.params["workspaceId"] ||
      request.params["id"];

    if (!workspaceId) {
      // If no workspace context requested, continue
      return true;
    }

    if (!Types.ObjectId.isValid(workspaceId)) {
      throw new NotFoundException("Invalid workspace ID format");
    }

    const member = await this.workspaceMemberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(user.userId),
    });

    if (!member) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    request.workspace = {
      workspaceId: member.workspaceId.toString(),
      role: member.role,
    };

    return true;
  }
}
