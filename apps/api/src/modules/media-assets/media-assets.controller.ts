import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { MediaAssetsService } from "./media-assets.service";
import type { MediaType, MediaSource } from "@repo/types";
import {
  generatePresignedUrlSchema,
  generateVoiceNarrationSchema,
  generateThumbnailVariantsSchema,
  selectPrimaryThumbnailSchema,
  startRenderJobSchema,
} from "@repo/validation";


@ApiTags("Media Assets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller()
export class MediaAssetsController {
  constructor(private readonly mediaAssetsService: MediaAssetsService) {}

  @Post("api/v1/media-assets/presigned-url")
  @ApiOperation({ summary: "Get presigned S3/MinIO upload URL" })
  async getPresignedUrl(
    @CurrentWorkspace() workspaceId: string,
    @Body() body: unknown,
  ) {
    const input = generatePresignedUrlSchema.parse(body);
    return this.mediaAssetsService.getPresignedUploadUrl(workspaceId, input);
  }

  @Post("api/v1/media-assets/upload")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Direct multipart media file upload" })
  async uploadFile(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @UploadedFile()
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Body("contentId") contentId?: string,
    @Body("type") type?: MediaType,
    @Body("title") title?: string,
    @Body("source") source?: MediaSource,
    @Body("license") license?: string,

  ) {
    if (!file) {
      throw new BadRequestException("No file provided for upload");
    }
    return this.mediaAssetsService.directUpload(
      workspaceId,
      user.id,
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      contentId,
      type,
      title,
      source,
      license,
    );
  }

  @Get("api/v1/media-assets")
  @ApiOperation({ summary: "List media assets in workspace" })
  async listMediaAssets(
    @CurrentWorkspace() workspaceId: string,
    @Query("type") type?: MediaType,
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    return this.mediaAssetsService.listMediaAssets(
      workspaceId,
      type,
      search,
      limit ? parseInt(limit, 10) : 50,
      page ? parseInt(page, 10) : 1,
    );
  }

  @Get("api/v1/media-assets/:id")
  @ApiOperation({ summary: "Get media asset by ID" })
  async getMediaAsset(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") id: string,
  ) {
    return this.mediaAssetsService.getMediaAssetById(workspaceId, id);
  }

  @Delete("api/v1/media-assets/:id")
  @ApiOperation({ summary: "Delete media asset" })
  async deleteMediaAsset(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") id: string,
  ) {
    return { success: await this.mediaAssetsService.deleteMediaAsset(workspaceId, id) };
  }

  @Get("api/v1/content/:id/media")
  @ApiOperation({ summary: "Get all media assets, voice, and thumbnails for a content item" })
  async getContentMedia(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") contentId: string,
  ) {
    return this.mediaAssetsService.getContentMediaPackage(workspaceId, contentId);
  }

  @Post("api/v1/content/:id/media/voice")
  @ApiOperation({ summary: "Generate AI voice narration for content script" })
  async generateVoice(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Param("id") contentId: string,
    @Body() body: unknown,
  ) {
    const input = generateVoiceNarrationSchema.parse(body);
    return this.mediaAssetsService.generateVoiceNarration(workspaceId, user.id, contentId, input);
  }

  @Post("api/v1/content/:id/media/thumbnails")
  @ApiOperation({ summary: "Generate thumbnail variants for A/B testing" })
  async generateThumbnails(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Param("id") contentId: string,
    @Body() body: unknown,
  ) {
    const input = generateThumbnailVariantsSchema.parse(body);
    return this.mediaAssetsService.generateThumbnailVariants(workspaceId, user.id, contentId, input);
  }

  @Patch("api/v1/content/:id/media/thumbnails/:thumbId/select")
  @ApiOperation({ summary: "Select primary thumbnail for content publication" })
  async selectThumbnail(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") contentId: string,
    @Param("thumbId") thumbId: string,
    @Body() body: unknown,
  ) {
    const input = selectPrimaryThumbnailSchema.parse({
      thumbnailAssetId: thumbId || (body as { thumbnailAssetId?: string })?.thumbnailAssetId,
    });
    return this.mediaAssetsService.selectPrimaryThumbnail(
      workspaceId,
      contentId,
      input.thumbnailAssetId,
    );
  }

  @Post("api/v1/content/:id/render")
  @ApiOperation({ summary: "Trigger video rendering pipeline for content" })
  async triggerRender(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Param("id") contentId: string,
    @Body() body: unknown,
  ) {
    const input = startRenderJobSchema.parse(body || {});
    return this.mediaAssetsService.dispatchRenderJob(
      workspaceId,
      user.id,
      contentId,
      input,
    );
  }

  @Get("api/v1/content/:id/render/status")
  @ApiOperation({ summary: "Get video rendering pipeline status" })
  async getRenderStatus(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") contentId: string,
  ) {
    return this.mediaAssetsService.getRenderJobStatus(workspaceId, contentId);
  }
}

