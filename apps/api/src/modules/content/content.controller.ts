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
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ContentService } from "./content.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type {
  CreateContentInput,
  UpdateContentInput,
} from "@repo/validation";
import type {
  ActiveWorkspaceContext,
  AuthenticatedUser,
  ContentDto,
  ContentVersionDto,
  PaginatedResponse,
} from "@repo/types";

@ApiTags("Content")
@Controller("content")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: "List content items with pagination and filters" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "status", required: false, type: String })
  @ApiQuery({ name: "contentType", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  async getContents(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
    @Query("contentType") contentType?: string,
    @Query("search") search?: string,
  ): Promise<PaginatedResponse<ContentDto>> {
    return this.contentService.findAll(workspace.workspaceId, {
      page,
      limit,
      status,
      contentType,
      search,
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "editor")
  @ApiOperation({ summary: "Create a new content item" })
  async createContent(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateContentInput,
  ): Promise<ContentDto> {
    return this.contentService.create(workspace.workspaceId, user.userId, input);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get content item details by ID" })
  async getContentById(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("id") id: string,
  ): Promise<ContentDto> {
    return this.contentService.findById(workspace.workspaceId, id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "editor")
  @ApiOperation({ summary: "Update content item and record a new version snapshot" })
  async updateContent(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() input: UpdateContentInput,
  ): Promise<ContentDto> {
    return this.contentService.update(workspace.workspaceId, user.userId, id, input);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete content item and its version history (Owner/Admin only)" })
  async deleteContent(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("id") id: string,
  ): Promise<void> {
    await this.contentService.delete(workspace.workspaceId, id);
  }

  @Get(":id/versions")
  @ApiOperation({ summary: "Get immutable version history for a content item" })
  async getVersions(
    @CurrentWorkspace() workspace: ActiveWorkspaceContext,
    @Param("id") id: string,
  ): Promise<ContentVersionDto[]> {
    return this.contentService.findVersions(workspace.workspaceId, id);
  }
}
