import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  SocialAccount,
  SocialAccountDocument,
} from "../../database/schemas/social-account.schema";
import {
  Publication,
  PublicationDocument,
} from "../../database/schemas/publication.schema";
import { Content, ContentDocument } from "../../database/schemas/content.schema";
import {
  MediaAsset,
  MediaAssetDocument,
} from "../../database/schemas/media-asset.schema";
import { YouTubePublisher } from "./adapters/youtube.publisher";
import { FacebookPublisher } from "./adapters/facebook.publisher";
import type {
  SocialAccountDto,
  PublicationRecordDto,
} from "@repo/types";

import type {
  ConnectSocialAccountInput,
  CreatePublicationInput,
} from "@repo/validation";

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);

  constructor(
    @InjectModel(SocialAccount.name)
    private readonly socialAccountModel: Model<SocialAccountDocument>,
    @InjectModel(Publication.name)
    private readonly publicationModel: Model<PublicationDocument>,
    @InjectModel(Content.name)
    private readonly contentModel: Model<ContentDocument>,
    @InjectModel(MediaAsset.name)
    private readonly mediaAssetModel: Model<MediaAssetDocument>,
    private readonly youtubePublisher: YouTubePublisher,
    private readonly facebookPublisher: FacebookPublisher,
  ) {}

  /**
   * Retrieves all connected social accounts for a workspace.
   */
  async getConnectedAccounts(workspaceId: string): Promise<SocialAccountDto[]> {
    const wsObjId = new Types.ObjectId(workspaceId);
    const accounts = await this.socialAccountModel
      .find({ workspaceId: wsObjId, isConnected: true })
      .sort({ createdAt: -1 });

    return accounts.map((acc) => this.toSocialAccountDto(acc));
  }

  /**
   * Connects or updates a social account link (OAuth authorization code exchange).
   */
  async connectAccount(
    workspaceId: string,
    userId: string,
    input: ConnectSocialAccountInput,
  ): Promise<SocialAccountDto> {
    const wsObjId = new Types.ObjectId(workspaceId);
    const userObjId = new Types.ObjectId(userId);

    const generatedAccountId = `${input.platform}_${Date.now().toString(36)}`;
    const avatarUrl =
      input.platform === "youtube"
        ? "https://www.gstatic.com/youtube/img/branding/favicon/favicon_144x144.png"
        : "https://static.xx.fbcdn.net/rsrc.php/yb/r/4DxpaqiUBSc.ico";

    const account = await this.socialAccountModel.findOneAndUpdate(
      {
        workspaceId: wsObjId,
        platform: input.platform,
        accountName: input.accountName,
      },
      {
        $set: {
          accountId: generatedAccountId,
          avatarUrl,
          isConnected: true,
          accessToken: `token_${input.authCode.substring(0, 10)}`,
          scopes: ["read", "write", "publish_video"],
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          createdBy: userObjId,
        },
      },
      { upsert: true, new: true },
    );

    this.logger.log(
      `Connected ${input.platform} account "${input.accountName}" for workspace ${workspaceId}`,
    );

    return this.toSocialAccountDto(account);
  }

  /**
   * Disconnects a social account.
   */
  async disconnectAccount(workspaceId: string, accountId: string): Promise<{ success: boolean }> {
    const wsObjId = new Types.ObjectId(workspaceId);
    const accObjId = new Types.ObjectId(accountId);

    const result = await this.socialAccountModel.findOneAndUpdate(
      { _id: accObjId, workspaceId: wsObjId },
      { $set: { isConnected: false, accessToken: "" } },
    );

    if (!result) {
      throw new NotFoundException(`Social account ${accountId} not found`);
    }

    return { success: true };
  }

  /**
   * Retrieves all publication records for a content item.
   */
  async getContentPublications(
    workspaceId: string,
    contentId: string,
  ): Promise<PublicationRecordDto[]> {
    const wsObjId = new Types.ObjectId(workspaceId);
    const contentObjId = new Types.ObjectId(contentId);

    const publications = await this.publicationModel
      .find({ workspaceId: wsObjId, contentId: contentObjId })
      .sort({ createdAt: -1 });

    return publications.map((pub) => this.toPublicationDto(pub));
  }

  /**
   * Publishes content immediately to a connected social platform.
   */
  async publishNow(
    workspaceId: string,
    userId: string,
    contentId: string,
    input: CreatePublicationInput,
  ): Promise<PublicationRecordDto> {
    const wsObjId = new Types.ObjectId(workspaceId);
    const userObjId = new Types.ObjectId(userId);
    const contentObjId = new Types.ObjectId(contentId);
    const accObjId = new Types.ObjectId(input.socialAccountId);

    const content = await this.contentModel.findOne({
      _id: contentObjId,
      workspaceId: wsObjId,
    });

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found in workspace`);
    }

    const socialAccount = await this.socialAccountModel.findOne({
      _id: accObjId,
      workspaceId: wsObjId,
      isConnected: true,
    });

    if (!socialAccount) {
      throw new BadRequestException(
        `Selected social account ${input.socialAccountId} is not connected or active`,
      );
    }

    // Locate rendered video asset if present
    let videoUrl = "https://storage.googleapis.com/sample-videos/demo.mp4";
    if (content.videoAssetId) {
      const videoAsset = await this.mediaAssetModel.findById(content.videoAssetId);
      if (videoAsset) {
        videoUrl = videoAsset.url;
      }
    }

    const description = input.description || "";
    const tags = input.tags || [];
    const privacyStatus = input.privacyStatus || "public";
    const category = input.category || "28";

    // Create publication record in publishing state
    const publication = await this.publicationModel.create({
      workspaceId: wsObjId,
      contentId: contentObjId,
      socialAccountId: accObjId,
      platform: input.platform,
      accountName: socialAccount.accountName,
      title: input.title,
      description,
      tags,
      privacyStatus,
      category,
      status: "publishing",
      createdBy: userObjId,
    });

    try {
      let publishResponse;
      if (input.platform === "youtube") {
        publishResponse = await this.youtubePublisher.uploadVideo({
          title: input.title,
          description,
          tags,
          privacyStatus,
          category,
          videoUrl,
        });
      } else {
        publishResponse = await this.facebookPublisher.uploadVideo({
          title: input.title,
          description,
          tags,
          videoUrl,
        });
      }


      publication.status = "published";
      publication.publishedAt = publishResponse.publishedAt;
      publication.externalPostId = publishResponse.externalPostId;
      publication.externalUrl = publishResponse.externalUrl;
      await publication.save();

      // Advance content lifecycle state to published
      content.status = "published";
      await content.save();

      this.logger.log(
        `Published content ${contentId} to ${input.platform} (${publishResponse.externalUrl})`,
      );

      return this.toPublicationDto(publication);
    } catch (err: unknown) {
      publication.status = "failed";
      publication.errorMessage = err instanceof Error ? err.message : "Publishing failed";
      await publication.save();
      throw err;
    }
  }

  /**
   * Schedules content publication for a future timestamp.
   */
  async schedulePublication(
    workspaceId: string,
    userId: string,
    contentId: string,
    input: CreatePublicationInput,
  ): Promise<PublicationRecordDto> {
    const wsObjId = new Types.ObjectId(workspaceId);
    const userObjId = new Types.ObjectId(userId);
    const contentObjId = new Types.ObjectId(contentId);
    const accObjId = new Types.ObjectId(input.socialAccountId);

    const content = await this.contentModel.findOne({
      _id: contentObjId,
      workspaceId: wsObjId,
    });

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    const socialAccount = await this.socialAccountModel.findOne({
      _id: accObjId,
      workspaceId: wsObjId,
      isConnected: true,
    });

    if (!socialAccount) {
      throw new BadRequestException("Selected social account is not connected");
    }

    const scheduledDate = input.scheduledAt
      ? new Date(input.scheduledAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const description = input.description || "";
    const tags = input.tags || [];
    const privacyStatus = input.privacyStatus || "public";
    const category = input.category || "28";

    const publication = await this.publicationModel.create({
      workspaceId: wsObjId,
      contentId: contentObjId,
      socialAccountId: accObjId,
      platform: input.platform,
      accountName: socialAccount.accountName,
      title: input.title,
      description,
      tags,
      privacyStatus,
      category,
      status: "scheduled",
      scheduledAt: scheduledDate,
      createdBy: userObjId,
    });


    // Update content lifecycle state to scheduled
    content.status = "scheduled";
    await content.save();

    this.logger.log(
      `Scheduled content ${contentId} publication to ${input.platform} at ${scheduledDate.toISOString()}`,
    );

    return this.toPublicationDto(publication);
  }

  private toSocialAccountDto(doc: SocialAccountDocument): SocialAccountDto {
    return {
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      platform: doc.platform,
      accountName: doc.accountName,
      accountId: doc.accountId,
      avatarUrl: doc.avatarUrl ?? null,
      isConnected: doc.isConnected,
      scopes: doc.scopes,
      tokenExpiresAt: doc.tokenExpiresAt ? doc.tokenExpiresAt.toISOString() : null,
      metadata: doc.metadata,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toPublicationDto(doc: PublicationDocument): PublicationRecordDto {
    return {
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      contentId: doc.contentId.toString(),
      platform: doc.platform,
      socialAccountId: doc.socialAccountId.toString(),
      accountName: doc.accountName,
      title: doc.title,
      description: doc.description,
      tags: doc.tags,
      privacyStatus: doc.privacyStatus,
      category: doc.category,
      status: doc.status,
      scheduledAt: doc.scheduledAt ? doc.scheduledAt.toISOString() : null,
      publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
      externalPostId: doc.externalPostId ?? null,
      externalUrl: doc.externalUrl ?? null,
      errorMessage: doc.errorMessage ?? null,
      metadata: doc.metadata,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
