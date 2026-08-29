import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { PublishingService } from "./publishing.service";
import {
  connectSocialAccountSchema,
  createPublicationSchema,
} from "@repo/validation";

@ApiTags("Publishing")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller()
export class PublishingController {
  constructor(private readonly publishingService: PublishingService) {}

  @Get("api/v1/social/accounts")
  @ApiOperation({ summary: "List connected social accounts in workspace" })
  async getConnectedAccounts(@CurrentWorkspace() workspaceId: string) {
    return this.publishingService.getConnectedAccounts(workspaceId);
  }

  @Post("api/v1/social/accounts/connect")
  @ApiOperation({ summary: "Connect a social media account (YouTube / Facebook)" })
  async connectAccount(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Body() body: unknown,
  ) {
    const input = connectSocialAccountSchema.parse(body);
    return this.publishingService.connectAccount(workspaceId, user.id, input);
  }

  @Delete("api/v1/social/accounts/:id")
  @ApiOperation({ summary: "Disconnect social media account" })
  async disconnectAccount(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") accountId: string,
  ) {
    return this.publishingService.disconnectAccount(workspaceId, accountId);
  }

  @Get("api/v1/content/:id/publications")
  @ApiOperation({ summary: "Get publication records for a content item" })
  async getContentPublications(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") contentId: string,
  ) {
    return this.publishingService.getContentPublications(workspaceId, contentId);
  }

  @Post("api/v1/content/:id/publish")
  @ApiOperation({ summary: "Publish content immediately to connected platform" })
  async publishNow(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Param("id") contentId: string,
    @Body() body: unknown,
  ) {
    const input = createPublicationSchema.parse(body);
    return this.publishingService.publishNow(
      workspaceId,
      user.id,
      contentId,
      input,
    );
  }

  @Post("api/v1/content/:id/schedule")
  @ApiOperation({ summary: "Schedule content publication for a future date" })
  async schedulePublication(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Param("id") contentId: string,
    @Body() body: unknown,
  ) {
    const input = createPublicationSchema.parse(body);
    return this.publishingService.schedulePublication(
      workspaceId,
      user.id,
      contentId,
      input,
    );
  }
}
