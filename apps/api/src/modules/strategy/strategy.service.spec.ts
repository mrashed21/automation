import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { StrategyService } from "./strategy.service";
import { StrategyRecommendation } from "../../database/schemas/strategy-recommendation.schema";
import { Content } from "../../database/schemas/content.schema";
import { AnalyticsSnapshot } from "../../database/schemas/analytics-snapshot.schema";
import { AiService } from "../ai/ai.service";

const mockWsId = new Types.ObjectId().toString();
const mockUserId = new Types.ObjectId().toString();
const mockRecId = new Types.ObjectId().toString();
const mockContentId = new Types.ObjectId().toString();

const mockRecommendationModel = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockContentModel = {
  find: jest.fn().mockReturnThis(),
  create: jest.fn(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockSnapshotModel = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockAiService = {
  generateStructuredJson: jest.fn(),
  generateText: jest.fn(),
};

describe("StrategyService", () => {
  let service: StrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrategyService,
        { provide: getModelToken(StrategyRecommendation.name), useValue: mockRecommendationModel },
        { provide: getModelToken(Content.name), useValue: mockContentModel },
        { provide: getModelToken(AnalyticsSnapshot.name), useValue: mockSnapshotModel },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<StrategyService>(StrategyService);
  });

  afterEach(() => jest.clearAllMocks());

  describe("discoverOpportunities", () => {
    it("should discover and return fresh topic opportunities via AI", async () => {
      mockContentModel.exec.mockResolvedValueOnce([]); // recent content for context
      mockAiService.generateStructuredJson.mockResolvedValueOnce({
        content: {
          opportunities: [
            {
              topic: "Automated YouTube Workflows",
              rationale: "High demand tech topic with great retention potential.",
              suggestedHooks: ["Here is how to automate your channel."],
              format: "shorts",
              niche: "Technology",
              keywords: ["youtube", "automation"],
              estimatedScore: 90,
            },
          ],
        },
      });

      const mockCreatedRec = {
        _id: new Types.ObjectId(mockRecId),
        workspaceId: new Types.ObjectId(mockWsId),
        topic: "Automated YouTube Workflows",
        rationale: "High demand tech topic with great retention potential.",
        suggestedHooks: ["Here is how to automate your channel."],
        format: "shorts",
        niche: "Technology",
        keywords: ["youtube", "automation"],
        estimatedScore: 90,
        status: "suggested",
        contentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: () => ({
          _id: new Types.ObjectId(mockRecId),
          workspaceId: new Types.ObjectId(mockWsId),
          topic: "Automated YouTube Workflows",
          rationale: "High demand tech topic with great retention potential.",
          suggestedHooks: ["Here is how to automate your channel."],
          format: "shorts",
          niche: "Technology",
          keywords: ["youtube", "automation"],
          estimatedScore: 90,
          status: "suggested",
          contentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      mockContentModel.exec.mockResolvedValueOnce([]); // diversity check
      mockRecommendationModel.create.mockResolvedValueOnce(mockCreatedRec);

      const result = await service.discoverOpportunities(mockWsId, {
        niche: "Technology",
        count: 1,
      });

      expect(result).toHaveLength(1);
      expect(result[0]!.topic).toBe("Automated YouTube Workflows");
      expect(result[0]!.estimatedScore).toBe(90);
    });

    it("should use fallback opportunities if AI service throws error", async () => {
      mockContentModel.exec.mockResolvedValueOnce([]);
      mockAiService.generateStructuredJson.mockRejectedValueOnce(new Error("AI Provider rate limit"));

      const mockFallbackRec = {
        _id: new Types.ObjectId(mockRecId),
        workspaceId: new Types.ObjectId(mockWsId),
        topic: "Fallback Topic",
        rationale: "Great topic.",
        suggestedHooks: ["Hook 1"],
        format: "shorts",
        niche: "Tech",
        keywords: ["ai"],
        estimatedScore: 92,
        status: "suggested",
        contentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: () => ({
          _id: new Types.ObjectId(mockRecId),
          workspaceId: new Types.ObjectId(mockWsId),
          topic: "Fallback Topic",
          rationale: "Great topic.",
          suggestedHooks: ["Hook 1"],
          format: "shorts",
          niche: "Tech",
          keywords: ["ai"],
          estimatedScore: 92,
          status: "suggested",
          contentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      mockContentModel.exec.mockResolvedValue([]); // diversity checks
      mockRecommendationModel.create.mockResolvedValue(mockFallbackRec);

      const result = await service.discoverOpportunities(mockWsId, { count: 3 });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("checkTopicDiversity", () => {
    it("should flag very similar topic as not unique", async () => {
      mockContentModel.exec.mockResolvedValueOnce([
        { title: "The Best AI Automation Stack in 2026" },
      ]);

      const result = await service.checkTopicDiversity(
        mockWsId,
        "The Best AI Automation Stack in 2026",
        0.7,
      );

      expect(result.isUnique).toBe(false);
      expect(result.maxSimilarity).toBeGreaterThanOrEqual(0.7);
      expect(result.conflictingTopic).toBe("The Best AI Automation Stack in 2026");
    });

    it("should allow distinct and creative topic", async () => {
      mockContentModel.exec.mockResolvedValueOnce([
        { title: "The Best AI Automation Stack in 2026" },
      ]);

      const result = await service.checkTopicDiversity(
        mockWsId,
        "Deep Sea Marine Exploration Secrets",
        0.7,
      );

      expect(result.isUnique).toBe(true);
      expect(result.maxSimilarity).toBeLessThan(0.7);
      expect(result.conflictingTopic).toBeNull();
    });
  });

  describe("produceFromOpportunity", () => {
    it("should convert recommendation into Content and update recommendation state", async () => {
      const mockRec = {
        _id: new Types.ObjectId(mockRecId),
        workspaceId: new Types.ObjectId(mockWsId),
        topic: "10x Creator Automation",
        rationale: "High viral score",
        suggestedHooks: ["Hook 1"],
        format: "shorts",
        niche: "Automation",
        keywords: ["tools"],
        estimatedScore: 95,
        status: "suggested",
        contentId: null,
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: new Types.ObjectId(mockRecId),
          workspaceId: new Types.ObjectId(mockWsId),
          topic: "10x Creator Automation",
          rationale: "High viral score",
          suggestedHooks: ["Hook 1"],
          format: "shorts",
          niche: "Automation",
          keywords: ["tools"],
          estimatedScore: 95,
          status: "in-production",
          contentId: new Types.ObjectId(mockContentId),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      mockRecommendationModel.findOne.mockResolvedValueOnce(mockRec);
      mockContentModel.create.mockResolvedValueOnce({
        _id: new Types.ObjectId(mockContentId),
      });

      const result = await service.produceFromOpportunity(mockWsId, mockUserId, mockRecId);

      expect(result.contentId).toBe(mockContentId);
      expect(result.opportunity.status).toBe("in-production");
      expect(mockRec.save).toHaveBeenCalled();
    });
  });

  describe("analyzePerformanceInsights", () => {
    it("should return strategic insights and calculated opportunity score", async () => {
      mockSnapshotModel.exec.mockResolvedValueOnce([
        { views: 25000, likes: 1200, comments: 340, shares: 150 },
      ]);
      mockContentModel.exec.mockResolvedValueOnce([
        { contentType: "youtube-short" },
        { contentType: "youtube-short" },
        { contentType: "youtube-long" },
      ]);

      const insights = await service.analyzePerformanceInsights(mockWsId);

      expect(insights.opportunityScore).toBeGreaterThanOrEqual(65);
      expect(insights.topHooks.length).toBeGreaterThan(0);
      expect(insights.suggestedFormatBalance.shortsPercent).toBeGreaterThan(0);
      expect(insights.growthObservations.length).toBeGreaterThan(0);
    });
  });
});
