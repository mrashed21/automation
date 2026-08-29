import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Content,
  ContentDocument,
} from "../../database/schemas/content.schema";
import {
  ContentVersion,
  ContentVersionDocument,
} from "../../database/schemas/content-version.schema";
import type {
  ContentDto,
  ContentVersionDto,
  PaginatedResponse,
} from "@repo/types";
import type {
  CreateContentInput,
  UpdateContentInput,
} from "@repo/validation";

export interface FindContentQuery {
  page?: number;
  limit?: number;
  status?: string;
  contentType?: string;
  search?: string;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name)
    private readonly contentModel: Model<ContentDocument>,
    @InjectModel(ContentVersion.name)
    private readonly contentVersionModel: Model<ContentVersionDocument>,
  ) {}

  /**
   * List content items in a workspace with pagination, filters, and search.
   */
  async findAll(
    workspaceId: string,
    query: FindContentQuery = {},
  ): Promise<PaginatedResponse<ContentDto>> {
    if (!Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException("Invalid workspace ID");
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (query.status) {
      filter["status"] = query.status;
    }

    if (query.contentType) {
      filter["contentType"] = query.contentType;
    }

    if (query.search && query.search.trim()) {
      filter["title"] = { $regex: query.search.trim(), $options: "i" };
    }

    const [total, documents] = await Promise.all([
      this.contentModel.countDocuments(filter),
      this.contentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: documents.map((doc) => this.toDto(doc)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get a single content item by ID with strict workspace isolation.
   */
  async findById(workspaceId: string, contentId: string): Promise<ContentDto> {
    if (!Types.ObjectId.isValid(contentId) || !Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException("Invalid content or workspace ID");
    }

    const doc = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!doc) {
      throw new NotFoundException(`Content item with ID "${contentId}" not found`);
    }

    return this.toDto(doc);
  }

  /**
   * Create a new content item and its initial immutable Version 1 snapshot.
   */
  async create(
    workspaceId: string,
    userId: string,
    input: CreateContentInput,
  ): Promise<ContentDto> {
    if (!Types.ObjectId.isValid(workspaceId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid workspace or user ID");
    }

    const content = await this.contentModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      contentType: input.contentType,
      language: input.language ?? "en",
      niche: input.niche?.trim() ?? null,
      status: "draft",
      currentVersion: 1,
      complianceStatus: "pending",
      createdBy: new Types.ObjectId(userId),
    });

    // Create initial version 1 snapshot
    await this.contentVersionModel.create({
      contentId: content._id,
      workspaceId: new Types.ObjectId(workspaceId),
      version: 1,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      language: content.language,
      niche: content.niche,
      changeReason: "Initial creation",
      source: "user",
      createdBy: new Types.ObjectId(userId),
    });

    return this.toDto(content);
  }

  /**
   * Update content item and automatically record a new version if key content changes.
   */
  async update(
    workspaceId: string,
    userId: string,
    contentId: string,
    input: UpdateContentInput,
  ): Promise<ContentDto> {
    if (!Types.ObjectId.isValid(contentId) || !Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException("Invalid content or workspace ID");
    }

    const existing = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!existing) {
      throw new NotFoundException(`Content item with ID "${contentId}" not found`);
    }

    const hasContentChanges =
      (input.title && input.title.trim() !== existing.title) ||
      (input.description !== undefined && input.description?.trim() !== existing.description) ||
      (input.niche !== undefined && input.niche?.trim() !== existing.niche) ||
      (input.language && input.language !== existing.language);

    if (input.title) existing.title = input.title.trim();
    if (input.description !== undefined) existing.description = input.description?.trim() ?? undefined;
    if (input.niche !== undefined) existing.niche = input.niche?.trim() ?? undefined;
    if (input.language) existing.language = input.language;
    if (input.status) existing.status = input.status;

    existing.updatedBy = new Types.ObjectId(userId);

    if (hasContentChanges) {
      existing.currentVersion += 1;

      // Create new immutable version snapshot
      await this.contentVersionModel.create({
        contentId: existing._id,
        workspaceId: existing.workspaceId,
        version: existing.currentVersion,
        title: existing.title,
        description: existing.description,
        contentType: existing.contentType,
        language: existing.language,
        niche: existing.niche,
        scriptId: existing.scriptId,
        thumbnailAssetId: existing.thumbnailAssetId,
        videoAssetId: existing.videoAssetId,
        changeReason: input.changeReason?.trim() || `Updated to version ${existing.currentVersion}`,
        source: "user",
        createdBy: new Types.ObjectId(userId),
      });
    }

    const updated = await existing.save();
    return this.toDto(updated);
  }

  /**
   * Delete content item and all associated version records.
   */
  async delete(workspaceId: string, contentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(contentId) || !Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException("Invalid content or workspace ID");
    }

    const deleted = await this.contentModel.findOneAndDelete({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!deleted) {
      throw new NotFoundException(`Content item with ID "${contentId}" not found`);
    }

    // Clean up associated versions
    await this.contentVersionModel.deleteMany({
      contentId: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });
  }

  /**
   * Get version history for a content item.
   */
  async findVersions(
    workspaceId: string,
    contentId: string,
  ): Promise<ContentVersionDto[]> {
    if (!Types.ObjectId.isValid(contentId) || !Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException("Invalid content or workspace ID");
    }

    const versions = await this.contentVersionModel
      .find({
        contentId: new Types.ObjectId(contentId),
        workspaceId: new Types.ObjectId(workspaceId),
      })
      .sort({ version: -1 })
      .exec();

    return versions.map((v) => this.toVersionDto(v));
  }

  /**
   * Map Mongoose ContentDocument to safe ContentDto.
   */
  toDto(doc: ContentDocument): ContentDto {
    return {
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      title: doc.title,
      description: doc.description ?? null,
      contentType: doc.contentType,
      language: doc.language,
      niche: doc.niche ?? null,
      status: doc.status,
      currentVersion: doc.currentVersion ?? 1,
      qualityScore: doc.qualityScore ?? null,
      complianceStatus: doc.complianceStatus,
      scheduledAt: doc.scheduledAt ? doc.scheduledAt.toISOString() : null,
      publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  /**
   * Map Mongoose ContentVersionDocument to safe ContentVersionDto.
   */
  toVersionDto(doc: ContentVersionDocument): ContentVersionDto {
    return {
      id: doc._id.toString(),
      contentId: doc.contentId.toString(),
      workspaceId: doc.workspaceId.toString(),
      version: doc.version,
      title: doc.title,
      description: doc.description ?? null,
      contentType: doc.contentType,
      language: doc.language,
      niche: doc.niche ?? null,
      scriptId: doc.scriptId ? doc.scriptId.toString() : null,
      thumbnailAssetId: doc.thumbnailAssetId ? doc.thumbnailAssetId.toString() : null,
      videoAssetId: doc.videoAssetId ? doc.videoAssetId.toString() : null,
      changeReason: doc.changeReason ?? "",
      source: doc.source,
      createdBy: doc.createdBy.toString(),
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
