import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type {
  AuthenticatedUser,
  WorkspaceDto,
  WorkspaceMemberDto,
} from "@repo/types";
import type {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateWorkspaceInput,
} from "@repo/validation";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { WorkspacesService } from "./workspaces.service";

@ApiTags("Workspaces")
@Controller("workspaces")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: "Get all workspaces for the authenticated user" })
  async getWorkspaces(@CurrentUser() user: AuthenticatedUser): Promise<WorkspaceDto[]> {
    return this.workspacesService.getUserWorkspaces(user.userId);
  }

  @Post()
  @ApiOperation({ summary: "Create a new workspace" })
  async createWorkspace(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateWorkspaceInput,
  ): Promise<WorkspaceDto> {
    const workspace = await this.workspacesService.createWorkspace(user.userId, input);
    return this.workspacesService.toDto(workspace);
  }

  @Get(":id")
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: "Get workspace details by ID" })
  async getWorkspaceById(@Param("id") id: string): Promise<WorkspaceDto> {
    const workspace = await this.workspacesService.getWorkspaceById(id);
    return this.workspacesService.toDto(workspace);
  }

  @Patch(":id")
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiOperation({ summary: "Update workspace settings (Owner/Admin only)" })
  async updateWorkspace(
    @Param("id") id: string,
    @Body() input: UpdateWorkspaceInput,
  ): Promise<WorkspaceDto> {
    const workspace = await this.workspacesService.updateWorkspace(id, input);
    return this.workspacesService.toDto(workspace);
  }

  @Get(":id/members")
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: "Get member list for workspace" })
  async getMembers(@Param("id") id: string): Promise<WorkspaceMemberDto[]> {
    return this.workspacesService.getWorkspaceMembers(id);
  }

  @Post(":id/members")
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiOperation({ summary: "Invite a new member to workspace (Owner/Admin only)" })
  async inviteMember(
    @Param("id") id: string,
    @Body() input: InviteMemberInput,
  ): Promise<{ success: true }> {
    await this.workspacesService.inviteMember(id, input);
    return { success: true };
  }

  @Patch(":id/members/:userId")
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiOperation({ summary: "Update a member role (Owner/Admin only)" })
  async updateMemberRole(
    @Param("id") id: string,
    @Param("userId") targetUserId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateMemberRoleInput,
  ): Promise<{ success: true }> {
    await this.workspacesService.updateMemberRole(id, targetUserId, user.userId, input);
    return { success: true };
  }

  @Delete(":id/members/:userId")
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles("owner", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a member from workspace (Owner/Admin only)" })
  async removeMember(
    @Param("id") id: string,
    @Param("userId") targetUserId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.workspacesService.removeMember(id, targetUserId, user.userId);
  }
}
