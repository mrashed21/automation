import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MediaAsset, MediaAssetDocument } from "../../database/schemas/media-asset.schema";
import { ThumbnailAsset, ThumbnailAssetDocument } from "../../database/schemas/thumbnail-asset.schema";
import { VoiceAsset, VoiceAssetDocument } from "../../database/schemas/voice-asset.schema";
import { Content, ContentDocument } from "../../database/schemas/content.schema";
import { Script, ScriptDocument } from "../../database/schemas/script.schema";
import { StorageService } from "../storage/storage.service";
import { AiService } from "../ai/ai.service";
import type {
  MediaAssetDto,
  ThumbnailAssetDto,
  VoiceAssetDto,
  ContentMediaPackageDto,
  PresignedUploadUrlDto,
  MediaType,
  MediaSource,
} from "@repo/types";
import type {
  GeneratePresignedUrlInput,
  GenerateVoiceNarrationInput,
  GenerateThumbnailVariantsInput,
} from "@repo/validation";

@Injectable()
export class MediaAssetsService {
  private readonly logger = new Logger(MediaAssetsService.name);

  constructor(
    @InjectModel(MediaAsset.name)
    private readonly mediaAssetModel: Model<MediaAssetDocument>,
    @InjectModel(ThumbnailAsset.name)
    private readonly thumbnailModel: Model<ThumbnailAssetDocument>,
    @InjectModel(VoiceAsset.name)
    private readonly voiceModel: Model<VoiceAssetDocument>,
    @InjectModel(Content.name)
    private readonly contentModel: Model<ContentDocument>,
    @InjectModel(Script.name)
    private readonly scriptModel: Model<ScriptDocument>,
    private readonly storageService: StorageService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Generates presigned upload URL for direct client-to-storage upload.
   */
  async getPresignedUploadUrl(
    workspaceId: string,
    input: GeneratePresignedUrlInput,
  ): Promise<PresignedUploadUrlDto> {
    const ext = input.fileName.includes(".") ? input.fileName.substring(input.fileName.lastIndexOf(".")) : "";
    const cleanName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueKey = `workspaces/${workspaceId}/uploads/${Date.now()}-${new Types.ObjectId().toString()}${ext ? "" : `_${cleanName}`}${ext}`;

    return this.storageService.getPresignedUploadUrl(uniqueKey, input.mimeType);
  }

  /**
   * Directly uploads a multipart file buffer and registers the MediaAsset record.
   */
  async directUpload(
    workspaceId: string,
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    contentId?: string,
    type?: MediaType,
    title?: string,
    source?: MediaSource,
    license?: string,
  ): Promise<MediaAssetDto> {
    const ext = pathExtension(file.originalname);
    const uniqueKey = `workspaces/${workspaceId}/${contentId ? `content/${contentId}/` : "library/"}${Date.now()}-${new Types.ObjectId().toString()}${ext}`;

    const uploadResult = await this.storageService.uploadBuffer(uniqueKey, file.buffer, file.mimetype);

    const assetType: MediaType = type || inferMediaType(file.mimetype);

    const assetDoc = await this.mediaAssetModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      contentId: contentId ? new Types.ObjectId(contentId) : null,
      type: assetType,
      title: title || file.originalname,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: uploadResult.sizeBytes,
      storageKey: uploadResult.storageKey,
      url: uploadResult.url,
      thumbnailUrl: assetType === "image" || assetType === "thumbnail" ? uploadResult.url : null,
      source: source || "uploaded",
      license: license || "Owner Reserved / Internal Asset",
      provider: "direct-upload",
      checksum: uploadResult.checksum,
      createdBy: new Types.ObjectId(userId),
    });

    return this.toMediaAssetDto(assetDoc);
  }

  /**
   * Lists media assets for a workspace with type filtering and pagination.
   */
  async listMediaAssets(
    workspaceId: string,
    type?: MediaType,
    search?: string,
    limit = 50,
    page = 1,
  ): Promise<{ data: MediaAssetDto[]; total: number; page: number; limit: number }> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (type) {
      filter["type"] = type;
    }

    if (search && search.trim()) {
      filter["title"] = { $regex: search.trim(), $options: "i" };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.mediaAssetModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.mediaAssetModel.countDocuments(filter),
    ]);

    return {
      data: docs.map((doc) => this.toMediaAssetDto(doc)),
      total,
      page,
      limit,
    };
  }

  /**
   * Retrieves a single media asset by ID.
   */
  async getMediaAssetById(workspaceId: string, assetId: string): Promise<MediaAssetDto> {
    const doc = await this.mediaAssetModel.findOne({
      _id: new Types.ObjectId(assetId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!doc) {
      throw new NotFoundException(`Media asset ${assetId} not found`);
    }

    return this.toMediaAssetDto(doc);
  }

  /**
   * Deletes a media asset and unlinks its storage file.
   */
  async deleteMediaAsset(workspaceId: string, assetId: string): Promise<boolean> {
    const doc = await this.mediaAssetModel.findOne({
      _id: new Types.ObjectId(assetId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!doc) {
      throw new NotFoundException(`Media asset ${assetId} not found`);
    }

    await this.storageService.deleteFile(doc.storageKey);
    await this.mediaAssetModel.deleteOne({ _id: doc._id });

    // Clean references in thumbnail/voice if applicable
    await this.thumbnailModel.deleteMany({ mediaAssetId: doc._id });
    await this.voiceModel.deleteMany({ mediaAssetId: doc._id });

    return true;
  }

  /**
   * Retrieves complete media package for a content item (assets, voice narration, thumbnail variants).
   */
  async getContentMediaPackage(workspaceId: string, contentId: string): Promise<ContentMediaPackageDto> {
    const content = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!content) {
      throw new NotFoundException(`Content item ${contentId} not found`);
    }

    const [assets, voiceDoc, thumbnailDocs] = await Promise.all([
      this.mediaAssetModel.find({
        contentId: content._id,
        workspaceId: content.workspaceId,
      }).sort({ createdAt: -1 }),
      this.voiceModel.findOne({
        contentId: content._id,
        workspaceId: content.workspaceId,
      }).sort({ createdAt: -1 }),
      this.thumbnailModel.find({
        contentId: content._id,
        workspaceId: content.workspaceId,
      }).sort({ variant: 1 }),
    ]);

    // Lookup media assets for thumbnails to attach URLs
    const thumbMediaIds = thumbnailDocs.map((t) => t.mediaAssetId);
    const thumbMedia = await this.mediaAssetModel.find({ _id: { $in: thumbMediaIds } });
    const thumbMediaMap = new Map<string, string>(thumbMedia.map((m) => [m._id.toString(), m.url]));

    // Lookup voice media url
    let voiceDto: VoiceAssetDto | null = null;
    if (voiceDoc) {
      const voiceMedia = await this.mediaAssetModel.findById(voiceDoc.mediaAssetId);
      voiceDto = {
        id: voiceDoc._id.toString(),
        workspaceId: voiceDoc.workspaceId.toString(),
        contentId: voiceDoc.contentId.toString(),
        scriptId: voiceDoc.scriptId ? voiceDoc.scriptId.toString() : "",
        mediaAssetId: voiceDoc.mediaAssetId.toString(),
        voiceId: voiceDoc.voiceId,
        voiceName: voiceDoc.voiceName,
        provider: voiceDoc.provider,
        durationSeconds: voiceDoc.durationSeconds,
        sampleRate: voiceDoc.sampleRate,
        audioFormat: voiceDoc.audioFormat,
        url: voiceMedia ? voiceMedia.url : "",
        createdAt: voiceDoc.createdAt.toISOString(),
        updatedAt: voiceDoc.updatedAt.toISOString(),
      };
    }

    const thumbnailsDto: ThumbnailAssetDto[] = thumbnailDocs.map((t) => ({
      id: t._id.toString(),
      workspaceId: t.workspaceId.toString(),
      contentId: t.contentId.toString(),
      mediaAssetId: t.mediaAssetId.toString(),
      prompt: t.prompt,
      variant: t.variant,
      headlineText: t.headlineText || "",
      style: t.style,
      ctrScoreEstimate: t.ctrScoreEstimate,
      status: t.status,
      url: thumbMediaMap.get(t.mediaAssetId.toString()) || "",
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    const selectedThumb = thumbnailDocs.find((t) => t.status === "selected");
    const renderedVideoDoc = assets.find((a) => a.type === "video" && a.source === "rendered");

    return {
      contentId: content._id.toString(),
      workspaceId: content.workspaceId.toString(),
      assets: assets.map((a) => this.toMediaAssetDto(a)),
      voice: voiceDto,
      thumbnails: thumbnailsDto,
      selectedThumbnailId: selectedThumb ? selectedThumb._id.toString() : null,
      renderedVideo: renderedVideoDoc ? this.toMediaAssetDto(renderedVideoDoc) : null,
    };
  }

  /**
   * Generates AI voice narration for a content item's script.
   */
  async generateVoiceNarration(
    workspaceId: string,
    userId: string,
    contentId: string,
    input: GenerateVoiceNarrationInput,
  ): Promise<VoiceAssetDto> {
    const content = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    let narrationText = input.customScriptText;

    if (!narrationText) {
      const script = await this.scriptModel.findOne({
        contentId: content._id,
        workspaceId: content.workspaceId,
      });

      if (!script || script.sections.length === 0) {
        throw new BadRequestException("Please generate or provide a script before creating voice narration");
      }

      narrationText = script.sections.map((s) => s.narration).join(" ");
    }

    // Generate voice via AI voice provider
    const aiVoiceResponse = await this.aiService.generateVoice(narrationText, {
      voiceId: input.voiceId,
      stability: input.stability,
      similarityBoost: input.similarityBoost,
    });

    // Save audio file buffer to storage
    const audioBuffer = aiVoiceResponse.audioBuffer || Buffer.from("RIFF mock audio buffer sample");
    const storageKey = `workspaces/${workspaceId}/content/${contentId}/voice-${Date.now()}.mp3`;
    const uploadResult = await this.storageService.uploadBuffer(storageKey, audioBuffer, "audio/mpeg");

    // Create MediaAsset record
    const mediaAsset = await this.mediaAssetModel.create({
      workspaceId: content.workspaceId,
      contentId: content._id,
      type: "audio",
      title: `Voice Narration (${input.voiceName})`,
      fileName: `voice-${Date.now()}.mp3`,
      mimeType: "audio/mpeg",
      sizeBytes: uploadResult.sizeBytes,
      storageKey: uploadResult.storageKey,
      url: uploadResult.url,
      source: "ai_generated",
      license: "AI Generated Voice Narration",
      provider: input.provider || "elevenlabs",
      checksum: uploadResult.checksum,
      durationSeconds: aiVoiceResponse.durationSeconds || Math.round(narrationText.split(" ").length / 2.4),
      createdBy: new Types.ObjectId(userId),
    });

    // Delete existing voice asset for this content item
    await this.voiceModel.deleteMany({
      contentId: content._id,
      workspaceId: content.workspaceId,
    });

    // Create VoiceAsset record
    const voiceDoc = await this.voiceModel.create({
      workspaceId: content.workspaceId,
      contentId: content._id,
      scriptId: content.scriptId || null,
      mediaAssetId: mediaAsset._id,
      voiceId: input.voiceId,
      voiceName: input.voiceName,
      provider: input.provider,
      durationSeconds: mediaAsset.durationSeconds || 60,
      sampleRate: 44100,
      audioFormat: "mp3",
    });

    // Update content pipeline status
    content.status = "voice-generating";
    await content.save();

    return {
      id: voiceDoc._id.toString(),
      workspaceId: voiceDoc.workspaceId.toString(),
      contentId: voiceDoc.contentId.toString(),
      scriptId: voiceDoc.scriptId ? voiceDoc.scriptId.toString() : "",
      mediaAssetId: mediaAsset._id.toString(),
      voiceId: voiceDoc.voiceId,
      voiceName: voiceDoc.voiceName,
      provider: voiceDoc.provider,
      durationSeconds: voiceDoc.durationSeconds,
      sampleRate: voiceDoc.sampleRate,
      audioFormat: voiceDoc.audioFormat,
      url: uploadResult.url,
      createdAt: voiceDoc.createdAt.toISOString(),
      updatedAt: voiceDoc.updatedAt.toISOString(),
    };
  }

  /**
   * Generates 3-4 distinct thumbnail variants for high-CTR A/B testing.
   */
  async generateThumbnailVariants(
    workspaceId: string,
    userId: string,
    contentId: string,
    input: GenerateThumbnailVariantsInput,
  ): Promise<ThumbnailAssetDto[]> {
    const content = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    const variants: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"].slice(0, input.variantCount) as ("A" | "B" | "C" | "D")[];
    const headline = input.headlineText || content.title.slice(0, 45).toUpperCase();

    // Remove older variants for this content
    await this.thumbnailModel.deleteMany({
      contentId: content._id,
      workspaceId: content.workspaceId,
    });

    const results: ThumbnailAssetDto[] = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]!;
      const prompt = `High-CTR YouTube thumbnail for "${content.title}". Style: ${input.style}. Bold focal subject, rich contrast, dynamic lighting. Variant ${variant}. ${input.customPrompt || ""}`;

      const aiImageResponse = await this.aiService.generateImage(prompt, {
        aspectRatio: "16:9",
        style: input.style,
      });

      // SVG/PNG placeholder preview buffer if provider returns mock
      const imageBuffer = Buffer.from(
        aiImageResponse.imageUrl && aiImageResponse.imageUrl.startsWith("data:")
          ? aiImageResponse.imageUrl.split(",")[1] || ""
          : `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${i === 0 ? "#6366f1" : i === 1 ? "#ec4899" : i === 2 ? "#eab308" : "#10b981"}"/>
                  <stop offset="100%" stop-color="#0f172a"/>
                </linearGradient>
              </defs>
              <rect width="1280" height="720" fill="url(#g)"/>
              <text x="640" y="320" fill="#ffffff" font-size="52" font-weight="900" font-family="sans-serif" text-anchor="middle">${headline}</text>
              <text x="640" y="420" fill="#cbd5e1" font-size="28" font-weight="600" font-family="sans-serif" text-anchor="middle">VARIANT ${variant} • ${input.style.toUpperCase()}</text>
            </svg>`,
      );


      const storageKey = `workspaces/${workspaceId}/content/${contentId}/thumb-var-${variant}-${Date.now()}.svg`;
      const uploadResult = await this.storageService.uploadBuffer(storageKey, imageBuffer, "image/svg+xml");

      const mediaAsset = await this.mediaAssetModel.create({
        workspaceId: content.workspaceId,
        contentId: content._id,
        type: "thumbnail",
        title: `Thumbnail Variant ${variant} (${headline})`,
        fileName: `thumb-variant-${variant}.svg`,
        mimeType: "image/svg+xml",
        sizeBytes: uploadResult.sizeBytes,
        storageKey: uploadResult.storageKey,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.url,
        source: "ai_generated",
        license: "AI Generated Thumbnail Asset",
        provider: "mock-image",
        checksum: uploadResult.checksum,
        width: 1280,
        height: 720,
        createdBy: new Types.ObjectId(userId),
      });

      const isFirst = i === 0;
      const ctrScore = Math.floor(82 + Math.random() * 14);

      const thumbDoc = await this.thumbnailModel.create({
        workspaceId: content.workspaceId,
        contentId: content._id,
        mediaAssetId: mediaAsset._id,
        prompt,
        variant,
        headlineText: headline,
        style: input.style,
        ctrScoreEstimate: ctrScore,
        status: isFirst ? "selected" : "ready",
      });

      if (isFirst) {
        content.thumbnailAssetId = thumbDoc._id;
        await content.save();
      }

      results.push({
        id: thumbDoc._id.toString(),
        workspaceId: thumbDoc.workspaceId.toString(),
        contentId: thumbDoc.contentId.toString(),
        mediaAssetId: mediaAsset._id.toString(),
        prompt: thumbDoc.prompt,
        variant: thumbDoc.variant,
        headlineText: thumbDoc.headlineText || "",
        style: thumbDoc.style,
        ctrScoreEstimate: thumbDoc.ctrScoreEstimate,
        status: thumbDoc.status,
        url: uploadResult.url,
        createdAt: thumbDoc.createdAt.toISOString(),
        updatedAt: thumbDoc.updatedAt.toISOString(),
      });
    }

    return results;
  }

  /**
   * Sets one thumbnail variant as the primary selected thumbnail for content publication.
   */
  async selectPrimaryThumbnail(
    workspaceId: string,
    contentId: string,
    thumbnailAssetId: string,
  ): Promise<ThumbnailAssetDto> {
    const content = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    const selectedDoc = await this.thumbnailModel.findOne({
      _id: new Types.ObjectId(thumbnailAssetId),
      contentId: content._id,
      workspaceId: content.workspaceId,
    });

    if (!selectedDoc) {
      throw new NotFoundException(`Thumbnail variant ${thumbnailAssetId} not found`);
    }

    // Set all other variants to ready
    await this.thumbnailModel.updateMany(
      { contentId: content._id, workspaceId: content.workspaceId },
      { $set: { status: "ready" } },
    );

    selectedDoc.status = "selected";
    await selectedDoc.save();

    content.thumbnailAssetId = selectedDoc._id;
    await content.save();

    const mediaAsset = await this.mediaAssetModel.findById(selectedDoc.mediaAssetId);

    return {
      id: selectedDoc._id.toString(),
      workspaceId: selectedDoc.workspaceId.toString(),
      contentId: selectedDoc.contentId.toString(),
      mediaAssetId: selectedDoc.mediaAssetId.toString(),
      prompt: selectedDoc.prompt,
      variant: selectedDoc.variant,
      headlineText: selectedDoc.headlineText || "",
      style: selectedDoc.style,
      ctrScoreEstimate: selectedDoc.ctrScoreEstimate,
      status: selectedDoc.status,
      url: mediaAsset ? mediaAsset.url : "",
      createdAt: selectedDoc.createdAt.toISOString(),
      updatedAt: selectedDoc.updatedAt.toISOString(),
    };
  }

  private toMediaAssetDto(doc: MediaAssetDocument): MediaAssetDto {
    return {
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      contentId: doc.contentId ? doc.contentId.toString() : null,
      type: doc.type,
      title: doc.title,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      storageKey: doc.storageKey,
      url: doc.url,
      thumbnailUrl: doc.thumbnailUrl ?? null,
      source: doc.source,
      license: doc.license,
      provider: doc.provider,
      checksum: doc.checksum,
      width: doc.width ?? null,
      height: doc.height ?? null,
      durationSeconds: doc.durationSeconds ?? null,
      metadata: doc.metadata,
      createdBy: doc.createdBy.toString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}

function inferMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.includes("subrip") || mimeType.includes("vtt")) return "subtitle";
  return "document";
}

function pathExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex !== -1 ? filename.substring(dotIndex) : "";
}
