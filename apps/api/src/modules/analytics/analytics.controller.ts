import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { AnalyticsService } from "./analytics.service";

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("api/v1/content/:id/analytics/snapshots")
  @ApiOperation({ summary: "Get all analytics snapshots for a content item (time-series)" })
  async getSnapshots(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") contentId: string,
  ) {
    return this.analyticsService.getSnapshots(contentId, workspaceId);
  }

  @Get("api/v1/content/:id/analytics/latest")
  @ApiOperation({ summary: "Get latest analytics metrics per platform for a content item" })
  async getLatest(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") contentId: string,
  ) {
    return this.analyticsService.getLatest(contentId, workspaceId);
  }

  @Post("api/v1/content/:id/analytics/sync")
  @ApiOperation({ summary: "Trigger manual analytics sync for a content item" })
  async syncAnalytics(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") contentId: string,
  ) {
    return this.analyticsService.syncForContent(contentId, workspaceId);
  }

  @Get("api/v1/analytics/summary")
  @ApiOperation({ summary: "Get aggregated analytics summary across all published content" })
  async getWorkspaceSummary(@CurrentWorkspace() workspaceId: string) {
    return this.analyticsService.getWorkspaceSummary(workspaceId);
  }
}
