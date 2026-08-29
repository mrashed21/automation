import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { PublishingService } from "./publishing.service";
import { SocialAccount } from "../../database/schemas/social-account.schema";
import { Publication } from "../../database/schemas/publication.schema";
import { Content } from "../../database/schemas/content.schema";
import { MediaAsset } from "../../database/schemas/media-asset.schema";
import { YouTubePublisher } from "./adapters/youtube.publisher";
import { FacebookPublisher } from "./adapters/facebook.publisher";

describe("PublishingService", () => {
  let service: PublishingService;
  const mockWorkspaceId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockContentId = new Types.ObjectId().toString();
  const mockAccountId = new Types.ObjectId().toString();

  const mockSocialAccount = {
    _id: new Types.ObjectId(mockAccountId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    platform: "youtube",
    accountName: "Tech Channel Official",
    accountId: "yt_12345",
    avatarUrl: "https://example.com/avatar.png",
    isConnected: true,
    scopes: ["read", "write"],
    tokenExpiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPublication = {
    _id: new Types.ObjectId(),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    contentId: new Types.ObjectId(mockContentId),
    socialAccountId: new Types.ObjectId(mockAccountId),
    platform: "youtube",
    accountName: "Tech Channel Official",
    title: "AI Revolution 2026",
    description: "Deep dive into autonomous AI operations.",
    tags: ["ai", "automation"],
    privacyStatus: "public",
    status: "published",
    publishedAt: new Date(),
    externalPostId: "yt_test_123",
    externalUrl: "https://www.youtube.com/watch?v=yt_test_123",
    save: jest.fn().mockResolvedValue(true),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockContent = {
    _id: new Types.ObjectId(mockContentId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    title: "AI Revolution 2026",
    status: "ready",
    videoAssetId: new Types.ObjectId(),
    save: jest.fn().mockResolvedValue(true),
  };

  const mockSocialAccountModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockSocialAccount]),
    }),
    findOne: jest.fn().mockResolvedValue(mockSocialAccount),
    findOneAndUpdate: jest.fn().mockResolvedValue(mockSocialAccount),
  };

  const mockPublicationModel = {
    create: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        ...mockPublication,
        ...data,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true),
      }),
    ),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockPublication]),
    }),
    findOne: jest.fn().mockResolvedValue(mockPublication),
  };


  const mockContentModel = {
    findOne: jest.fn().mockResolvedValue(mockContent),
  };

  const mockMediaAssetModel = {
    findById: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      url: "https://storage.googleapis.com/test/video.mp4",
    }),
  };

  const mockYouTubePublisher = {
    uploadVideo: jest.fn().mockResolvedValue({
      externalPostId: "yt_test_123",
      externalUrl: "https://www.youtube.com/watch?v=yt_test_123",
      publishedAt: new Date(),
      status: "published",
    }),
  };

  const mockFacebookPublisher = {
    uploadVideo: jest.fn().mockResolvedValue({
      externalPostId: "fb_test_456",
      externalUrl: "https://www.facebook.com/watch/?v=fb_test_456",
      publishedAt: new Date(),
      status: "published",
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishingService,
        { provide: getModelToken(SocialAccount.name), useValue: mockSocialAccountModel },
        { provide: getModelToken(Publication.name), useValue: mockPublicationModel },
        { provide: getModelToken(Content.name), useValue: mockContentModel },
        { provide: getModelToken(MediaAsset.name), useValue: mockMediaAssetModel },
        { provide: YouTubePublisher, useValue: mockYouTubePublisher },
        { provide: FacebookPublisher, useValue: mockFacebookPublisher },
      ],
    }).compile();

    service = module.get<PublishingService>(PublishingService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should list connected social accounts", async () => {
    const accounts = await service.getConnectedAccounts(mockWorkspaceId);
    expect(accounts.length).toBe(1);
    expect(accounts[0]!.accountName).toBe("Tech Channel Official");
  });

  it("should connect a social account", async () => {
    const connected = await service.connectAccount(mockWorkspaceId, mockUserId, {
      platform: "youtube",
      authCode: "code-123456",
      accountName: "Tech Channel Official",
    });

    expect(connected.platform).toBe("youtube");
    expect(mockSocialAccountModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it("should publish content immediately to YouTube", async () => {
    const published = await service.publishNow(
      mockWorkspaceId,
      mockUserId,
      mockContentId,
      {
        platform: "youtube",
        socialAccountId: mockAccountId,
        title: "AI Revolution 2026",
        description: "Deep dive into autonomous AI operations.",
        tags: ["ai", "tech"],
        privacyStatus: "public",
        category: "28",
        publishNow: true,
      },
    );

    expect(published.status).toBe("published");
    expect(published.externalUrl).toContain("youtube.com");
    expect(mockYouTubePublisher.uploadVideo).toHaveBeenCalled();
    expect(mockContent.save).toHaveBeenCalled();
  });

  it("should schedule content publication for a future date", async () => {
    const scheduled = await service.schedulePublication(
      mockWorkspaceId,
      mockUserId,
      mockContentId,
      {
        platform: "youtube",
        socialAccountId: mockAccountId,
        title: "AI Revolution 2026",
        description: "Deep dive into autonomous AI operations.",
        tags: ["ai"],
        privacyStatus: "public",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        publishNow: false,
      },
    );

    expect(scheduled.status).toBe("scheduled");
    expect(mockPublicationModel.create).toHaveBeenCalled();
  });
});
