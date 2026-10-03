import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type {
  ActiveWorkspaceContext,
  AuthenticatedUser,
  ScriptDto,
  ScriptVersionDto,
} from "@repo/types";
import type { GenerateScriptInput, UpdateScriptInput } from "@repo/validation";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { ScriptService } from "./script.service";

@ApiTags("Script")
@Controller("content")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class ScriptController {
  constructor(private readonly scriptService: ScriptService) {}

  @Post(":id/script")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "editor")
  @ApiOperation({ summary: "Generate or regenerate structured multi-section script via AI" })
  async generateScript(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") contentId: string,
    @Body() input?: GenerateScriptInput,
  ): Promise<ScriptDto> {
    return this.scriptService.generateScript(
      workspace.workspaceId,
      user.userId,
      contentId,
      input,
    );
  }

  @Get(":id/script")
  @ApiOperation({ summary: "Get current script for a content item" })
  async getScript(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("id") contentId: string,
  ): Promise<ScriptDto> {
    return this.scriptService.getScriptByContentId(workspace.workspaceId, contentId);
  }

  @Patch(":id/script")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "editor")
  @ApiOperation({ summary: "Update script sections and record a new immutable version revision" })
  async updateScript(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") contentId: string,
    @Body() input: UpdateScriptInput,
  ): Promise<ScriptDto> {
    return this.scriptService.updateScript(
      workspace.workspaceId,
      user.userId,
      contentId,
      input,
    );
  }

  @Get(":id/script/versions")
  @ApiOperation({ summary: "Get immutable version history for the script" })
  async getScriptVersions(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("id") contentId: string,
  ): Promise<ScriptVersionDto[]> {
    return this.scriptService.getScriptVersions(workspace.workspaceId, contentId);
  }
}
