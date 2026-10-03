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
  ResearchDto,
  ResearchFactDto,
} from "@repo/types";
import type { GenerateResearchInput, VerifyFactInput } from "@repo/validation";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { ResearchService } from "./research.service";

@ApiTags("Research")
@Controller("content")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post(":id/research")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "editor")
  @ApiOperation({ summary: "Trigger AI research and fact extraction for a content item" })
  async generateResearch(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") contentId: string,
    @Body() input?: GenerateResearchInput,
  ): Promise<ResearchDto> {
    return this.researchService.generateResearch(
      workspace.workspaceId,
      user.userId,
      contentId,
      input,
    );
  }

  @Get(":id/research")
  @ApiOperation({ summary: "Get research package, sources, and verified facts for a content item" })
  async getResearch(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("id") contentId: string,
  ): Promise<ResearchDto> {
    return this.researchService.getResearchByContentId(workspace.workspaceId, contentId);
  }

  @Patch(":id/research/facts/:factId")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "editor")
  @ApiOperation({ summary: "Update verification status and notes for a specific factual claim" })
  async updateFact(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("factId") factId: string,
    @Body() input: VerifyFactInput,
  ): Promise<ResearchFactDto> {
    return this.researchService.updateFact(workspace.workspaceId, factId, input);
  }

  @Post(":id/research/verify")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "editor")
  @ApiOperation({ summary: "Run automated batch fact verification on all claims" })
  async verifyAllFacts(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("id") contentId: string,
  ): Promise<ResearchDto> {
    return this.researchService.verifyAllFacts(workspace.workspaceId, contentId);
  }
}
