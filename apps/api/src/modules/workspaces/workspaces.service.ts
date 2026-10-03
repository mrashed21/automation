import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { WorkspaceDto, WorkspaceMemberDto, WorkspaceMemberRole } from "@repo/types";
import type {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateWorkspaceInput,
} from "@repo/validation";
import { Model, Types } from "mongoose";
import {
  WorkspaceMember,
  WorkspaceMemberDocument,
} from "../../database/schemas/workspace-member.schema";
import { Workspace, WorkspaceDocument } from "../../database/schemas/workspace.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(WorkspaceMember.name)
    private workspaceMemberModel: Model<WorkspaceMemberDocument>,
    private usersService: UsersService,
  ) {}

  async createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<WorkspaceDocument> {
    const slugBase = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = slugBase || "workspace";
    let suffix = 1;

    while (await this.workspaceModel.findOne({ slug })) {
      slug = `${slugBase}-${suffix++}`;
    }

    const workspace = new this.workspaceModel({
      name: input.name,
      slug,
      niche: input.niche || null,
      language: input.language || "en",
      dailyContentTarget: input.dailyContentTarget || 1,
      automationMode: "approval-required",
      isAutomationEnabled: false,
      ownerId: new Types.ObjectId(userId),
    });

    const savedWorkspace = await workspace.save();

    // Automatically make creator the owner
    const member = new this.workspaceMemberModel({
      workspaceId: savedWorkspace._id,
      userId: new Types.ObjectId(userId),
      role: "owner",
    });

    await member.save();

    return savedWorkspace;
  }

  async getUserWorkspaces(userId: string): Promise<WorkspaceDto[]> {
    const memberships = await this.workspaceMemberModel.find({
      userId: new Types.ObjectId(userId),
    });

    const workspaceIds = memberships.map((m) => m.workspaceId);
    const workspaces = await this.workspaceModel.find({ _id: { $in: workspaceIds } });

    return workspaces.map((w) => this.toDto(w));
  }

  async getWorkspaceById(workspaceId: string): Promise<WorkspaceDocument> {
    if (!Types.ObjectId.isValid(workspaceId)) {
      throw new NotFoundException("Workspace not found");
    }

    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceInput,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.getWorkspaceById(workspaceId);

    if (input.name !== undefined) workspace.name = input.name;
    if (input.niche !== undefined) workspace.niche = input.niche;
    if (input.language !== undefined) workspace.language = input.language;
    if (input.dailyContentTarget !== undefined)
      workspace.dailyContentTarget = input.dailyContentTarget;
    if (input.automationMode !== undefined) workspace.automationMode = input.automationMode;
    if (input.isAutomationEnabled !== undefined)
      workspace.isAutomationEnabled = input.isAutomationEnabled;

    return workspace.save();
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberDto[]> {
    const members = await this.workspaceMemberModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .populate<{ userId: { _id: Types.ObjectId; email: string; name: string; avatarUrl?: string; createdAt: Date } }>("userId");

    return members
      .filter((m) => m.userId)
      .map((m) => ({
        id: m._id.toString(),
        workspaceId: m.workspaceId.toString(),
        userId: m.userId._id.toString(),
        user: {
          id: m.userId._id.toString(),
          email: m.userId.email,
          name: m.userId.name,
          avatarUrl: m.userId.avatarUrl || null,
          createdAt: m.userId.createdAt.toISOString(),
        },
        role: m.role,
        joinedAt: m.createdAt.toISOString(),
      }));
  }

  async inviteMember(
    workspaceId: string,
    input: InviteMemberInput,
  ): Promise<WorkspaceMemberDocument> {
    const userToInvite = await this.usersService.findByEmail(input.email);
    if (!userToInvite) {
      throw new NotFoundException(
        "No registered user found with this email. Users must register before being added to a workspace.",
      );
    }

    const existing = await this.workspaceMemberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: userToInvite._id,
    });

    if (existing) {
      throw new ConflictException("User is already a member of this workspace.");
    }

    const member = new this.workspaceMemberModel({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: userToInvite._id,
      role: input.role as WorkspaceMemberRole,
    });

    return member.save();
  }

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    currentUserId: string,
    input: UpdateMemberRoleInput,
  ): Promise<WorkspaceMemberDocument> {
    if (targetUserId === currentUserId) {
      throw new BadRequestException("You cannot modify your own role.");
    }

    const member = await this.workspaceMemberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(targetUserId),
    });

    if (!member) {
      throw new NotFoundException("Workspace member not found.");
    }

    if (member.role === "owner") {
      throw new ForbiddenException("Cannot modify the owner's role.");
    }

    member.role = input.role as WorkspaceMemberRole;
    return member.save();
  }

  async removeMember(
    workspaceId: string,
    targetUserId: string,
    currentUserId: string,
  ): Promise<void> {
    if (targetUserId === currentUserId) {
      throw new BadRequestException("You cannot remove yourself from the workspace directly.");
    }

    const member = await this.workspaceMemberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(targetUserId),
    });

    if (!member) {
      throw new NotFoundException("Workspace member not found.");
    }

    if (member.role === "owner") {
      throw new ForbiddenException("Cannot remove the workspace owner.");
    }

    await this.workspaceMemberModel.findByIdAndDelete(member._id);
  }

  toDto(workspace: WorkspaceDocument): WorkspaceDto {
    return {
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      niche: workspace.niche || null,
      language: workspace.language,
      automationMode: workspace.automationMode,
      dailyContentTarget: workspace.dailyContentTarget,
      isAutomationEnabled: workspace.isAutomationEnabled,
      createdAt: workspace.createdAt.toISOString(),
    };
  }
}
