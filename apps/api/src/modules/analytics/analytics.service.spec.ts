import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { AnalyticsSnapshot } from "../../database/schemas/analytics-snapshot.schema";
import { Content } from "../../database/schemas/content.schema";
import { Publication } from "../../database/schemas/publication.schema";
import { SocialAccount } from "../../database/schemas/social-account.schema";
import { AnalyticsService } from "./analytics.service";

const makeObjectId = () => new Types.ObjectId();

const mockSnapshotModel = {
  find: jest.fn().mockReturnThis(),
  create: jest.fn(),
  aggregate: jest.fn().mockResolvedValue([]),
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockPublicationModel = {
  find: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockSocialAccountModel = {
  findById: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(null),
};

const mockContentModel = {
  countDocuments: jest.fn().mockResolvedValue(5),
};

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getModelToken(AnalyticsSnapshot.name), useValue: mockSnapshotModel },
        { provide: getModelToken(Publication.name), useValue: mockPublicationModel },
        { provide: getModelToken(SocialAccount.name), useValue: mockSocialAccountModel },
        { provide: getModelToken(Content.name), useValue: mockContentModel },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe("syncForContent", () => {
    it("should return empty array when no published publications exist", async () => {
      mockPublicationModel.exec.mockResolvedValueOnce([]);
      const result = await service.syncForContent(
        makeObjectId().toString(),
        makeObjectId().toString(),
      );
      expect(result).toEqual([]);
    });

    it("should skip account if not found", async () => {
      const pubId = makeObjectId();
      mockPublicationModel.exec.mockResolvedValueOnce([
        {
          _id: pubId,
          contentId: makeObjectId(),
          workspaceId: makeObjectId(),
          socialAccountId: makeObjectId(),
          platform: "youtube",
          externalPostId: "yt-123",
          status: "published",
        },
      ]);
      mockSocialAccountModel.exec.mockResolvedValueOnce(null);
      const result = await service.syncForContent(
        makeObjectId().toString(),
        makeObjectId().toString(),
      );
      expect(result).toEqual([]);
    });
  });

  describe("getSnapshots", () => {
    it("should return time-series snapshots sorted by date", async () => {
      const id = makeObjectId();
      const cid = makeObjectId();
      const wid = makeObjectId();
      const now = new Date();
      mockSnapshotModel.exec.mockResolvedValueOnce([
        {
          _id: id,
          contentId: cid,
          platform: "youtube",
          capturedAt: now,
          views: 1000,
          likes: 50,
          comments: 10,
          shares: 5,
          watchTimeSeconds: null,
          averageViewDurationSeconds: null,
          retentionPercent: null,
          clickThroughRate: null,
          subscribersGained: null,
          followersGained: null,
        },
      ]);
      const result = await service.getSnapshots(cid.toString(), wid.toString());
      expect(result).toHaveLength(1);
      expect(result[0]!.views).toBe(1000);
      expect(result[0]!.platform).toBe("youtube");
    });
  });

  describe("getWorkspaceSummary", () => {
    it("should return zero totals when no snapshots", async () => {
      mockSnapshotModel.aggregate.mockResolvedValueOnce([]);
      const result = await service.getWorkspaceSummary(
        makeObjectId().toString(),
      );
      expect(result.totalViews).toBe(0);
      expect(result.totalLikes).toBe(0);
      expect(result.publishedContentCount).toBe(5);
    });

    it("should aggregate workspace totals from snapshots", async () => {
      mockSnapshotModel.aggregate.mockResolvedValueOnce([
        { totalViews: 50000, totalLikes: 2500, totalComments: 800, totalWatchTime: 720000 },
      ]);
      const result = await service.getWorkspaceSummary(
        makeObjectId().toString(),
      );
      expect(result.totalViews).toBe(50000);
      expect(result.totalLikes).toBe(2500);
      expect(result.totalWatchTimeHours).toBe(200);
    });
  });
});
