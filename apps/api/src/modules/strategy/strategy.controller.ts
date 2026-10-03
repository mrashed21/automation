import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { OpportunityStatus } from "@repo/types";
import {
  autoDiscoverTopicsSchema,
  checkTopicDiversitySchema,
} from "@repo/validation";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { StrategyService } from "./strategy.service";

@ApiTags("Strategy")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller()
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get("api/v1/strategy/opportunities")
  @ApiOperation({ summary: "List AI-discovered content opportunities" })
  async listOpportunities(
    @CurrentWorkspace() workspaceId: string,
    @Query("status") status?: OpportunityStatus,
  ) {
    return this.strategyService.listOpportunities(workspaceId, status);
  }

  @Post("api/v1/strategy/discover")
  @ApiOperation({ summary: "Trigger AI Autonomous Strategist topic discovery" })
  async discoverOpportunities(
    @CurrentWorkspace() workspaceId: string,
    @Body() body: unknown,
  ) {
    const input = autoDiscoverTopicsSchema.parse(body || {});
    return this.strategyService.discoverOpportunities(workspaceId, input);
  }

  @Post("api/v1/strategy/opportunities/:id/produce")
  @ApiOperation({ summary: "Convert a topic opportunity into an active Content production pipeline" })
  async produceFromOpportunity(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    return this.strategyService.produceFromOpportunity(workspaceId, user.id, id);
  }

  @Patch("api/v1/strategy/opportunities/:id/reject")
  @ApiOperation({ summary: "Dismiss / reject a topic opportunity" })
  async dismissOpportunity(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") id: string,
  ) {
    return this.strategyService.dismissOpportunity(workspaceId, id);
  }

  @Post("api/v1/strategy/diversity-check")
  @ApiOperation({ summary: "Check topic diversity/similarity against workspace library" })
  async checkTopicDiversity(
    @CurrentWorkspace() workspaceId: string,
    @Body() body: unknown,
  ) {
    const input = checkTopicDiversitySchema.parse(body);
    return this.strategyService.checkTopicDiversity(
      workspaceId,
      input.topic,
      input.threshold,
    );
  }

  @Get("api/v1/strategy/insights")
  @ApiOperation({ summary: "Get strategic insights, top hooks, and format balance recommendations" })
  async getInsights(@CurrentWorkspace() workspaceId: string) {
    return this.strategyService.analyzePerformanceInsights(workspaceId);
  }
}
