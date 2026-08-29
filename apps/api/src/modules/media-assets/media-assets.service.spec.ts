import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { MediaAssetsService } from "./media-assets.service";
import { MediaAsset } from "../../database/schemas/media-asset.schema";
import { ThumbnailAsset } from "../../database/schemas/thumbnail-asset.schema";
import { VoiceAsset } from "../../database/schemas/voice-asset.schema";
import { Content } from "../../database/schemas/content.schema";
import { Script } from "../../database/schemas/script.schema";
import { StorageService } from "../storage/storage.service";
import { AiService } from "../ai/ai.service";

describe("MediaAssetsService", () => {
  let service: MediaAssetsService;
  const mockWorkspaceId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockContentId = new Types.ObjectId().toString();

  const mockMediaAsset = {
    _id: new Types.ObjectId(),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    contentId: new Types.ObjectId(mockContentId),
    type: "image",
    title: "Test Image",
    fileName: "image.png",
    mimeType: "image/png",
    sizeBytes: 1024,
    storageKey: "test/image.png",
    url: "http://localhost:3010/uploads/test/image.png",
    thumbnailUrl: null,
    source: "uploaded",
    license: "Standard",
    provider: "manual",
    checksum: "abc123sha",
    width: 1920,
    height: 1080,
    durationSeconds: null,
    metadata: {},
    createdBy: new Types.ObjectId(mockUserId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockContent = {
    _id: new Types.ObjectId(mockContentId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    title: "How Autonomous AI Works",
    status: "scripting",
    save: jest.fn().mockResolvedValue(true),
  };

  const mockMediaAssetModel = {
    create: jest.fn().mockResolvedValue(mockMediaAsset),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockMediaAsset]),
        }),
      }),
    }),
    findOne: jest.fn().mockResolvedValue(mockMediaAsset),
    findById: jest.fn().mockResolvedValue(mockMediaAsset),
    countDocuments: jest.fn().mockResolvedValue(1),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  const mockThumbnailModel = {
    create: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      workspaceId: new Types.ObjectId(mockWorkspaceId),
      contentId: new Types.ObjectId(mockContentId),
      mediaAssetId: mockMediaAsset._id,
      prompt: "Thumbnail test",
      variant: "A",
      headlineText: "AI REVOLUTION",
      style: "youtube_high_ctr",
      ctrScoreEstimate: 92,
      status: "selected",
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    }),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    }),
    findOne: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      workspaceId: new Types.ObjectId(mockWorkspaceId),
      contentId: new Types.ObjectId(mockContentId),
      mediaAssetId: mockMediaAsset._id,
      variant: "A",
      status: "ready",
      save: jest.fn().mockResolvedValue(true),
    }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  };

  const mockVoiceModel = {
    create: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      workspaceId: new Types.ObjectId(mockWorkspaceId),
      contentId: new Types.ObjectId(mockContentId),
      scriptId: null,
      mediaAssetId: mockMediaAsset._id,
      voiceId: "voice-123",
      voiceName: "Rachel",
      provider: "elevenlabs",
      durationSeconds: 45,
      sampleRate: 44100,
      audioFormat: "mp3",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findOne: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  const mockContentModel = {
    findOne: jest.fn().mockResolvedValue(mockContent),
  };

  const mockScriptModel = {
    findOne: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      sections: [{ narration: "Welcome to this autonomous video test." }],
    }),
  };

  const mockStorageService = {
    getPresignedUploadUrl: jest.fn().mockResolvedValue({
      uploadUrl: "http://localhost:3010/api/v1/media-assets/direct-upload",
      storageKey: "test-key",
      publicUrl: "http://localhost:3010/uploads/test-key",
      expiresInSeconds: 3600,
    }),
    uploadBuffer: jest.fn().mockResolvedValue({
      url: "http://localhost:3010/uploads/test-key",
      storageKey: "test-key",
      sizeBytes: 1024,
      checksum: "abc123sha",
    }),
    deleteFile: jest.fn().mockResolvedValue(true),
    getPublicUrl: jest.fn().mockReturnValue("http://localhost:3010/uploads/test-key"),
  };

  const mockAiService = {
    generateVoice: jest.fn().mockResolvedValue({
      audioBuffer: Buffer.from("mock audio buffer"),
      durationSeconds: 30,
    }),
    generateImage: jest.fn().mockResolvedValue({
      url: "http://localhost:3010/uploads/generated.png",
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaAssetsService,
        { provide: getModelToken(MediaAsset.name), useValue: mockMediaAssetModel },
        { provide: getModelToken(ThumbnailAsset.name), useValue: mockThumbnailModel },
        { provide: getModelToken(VoiceAsset.name), useValue: mockVoiceModel },
        { provide: getModelToken(Content.name), useValue: mockContentModel },
        { provide: getModelToken(Script.name), useValue: mockScriptModel },
        { provide: StorageService, useValue: mockStorageService },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<MediaAssetsService>(MediaAssetsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate presigned upload URL", async () => {
    const result = await service.getPresignedUploadUrl(mockWorkspaceId, {
      fileName: "video.mp4",
      mimeType: "video/mp4",
      type: "video",
      sizeBytes: 5000000,
    });
    expect(result.uploadUrl).toBeDefined();
    expect(mockStorageService.getPresignedUploadUrl).toHaveBeenCalled();
  });

  it("should direct upload a file and register MediaAsset", async () => {
    const result = await service.directUpload(
      mockWorkspaceId,
      mockUserId,
      {
        buffer: Buffer.from("dummy data"),
        originalname: "broll.mp4",
        mimetype: "video/mp4",
        size: 1024,
      },
      mockContentId,
      "video",
      "Epic B-Roll Footage",
    );

    expect(result.id).toBeDefined();
    expect(mockMediaAssetModel.create).toHaveBeenCalled();
  });

  it("should generate AI voice narration for script", async () => {
    const voiceResult = await service.generateVoiceNarration(
      mockWorkspaceId,
      mockUserId,
      mockContentId,
      {
        voiceId: "21m00Tcm4TlvDq8ikWAM",
        voiceName: "Rachel",
        provider: "elevenlabs",
        stability: 0.75,
        similarityBoost: 0.75,
      },
    );

    expect(voiceResult.id).toBeDefined();
    expect(mockAiService.generateVoice).toHaveBeenCalled();
    expect(mockVoiceModel.create).toHaveBeenCalled();
  });

  it("should generate thumbnail variants for A/B testing", async () => {
    const variants = await service.generateThumbnailVariants(
      mockWorkspaceId,
      mockUserId,
      mockContentId,
      {
        style: "youtube_high_ctr",
        headlineText: "TOP 5 SECRETS",
        variantCount: 3,
      },
    );

    expect(variants.length).toBe(3);
    expect(mockAiService.generateImage).toHaveBeenCalled();
    expect(mockThumbnailModel.create).toHaveBeenCalled();
  });
});
