import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ResearchService } from "./research.service";
import { Research } from "../../database/schemas/research.schema";
import { ResearchSource } from "../../database/schemas/research-source.schema";
import { ResearchFact } from "../../database/schemas/research-fact.schema";
import { Content } from "../../database/schemas/content.schema";
import { AiService } from "../ai/ai.service";

describe("ResearchService", () => {
  let service: ResearchService;

  const mockWorkspaceId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockContentId = new Types.ObjectId().toString();
  const mockResearchId = new Types.ObjectId().toString();

  const mockContent = {
    _id: new Types.ObjectId(mockContentId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    title: "AI Video Production in 2026",
    contentType: "youtube-long",
    language: "en",
    niche: "Technology",
    status: "draft",
    save: jest.fn().mockResolvedValue(true),
  };

  const mockResearchDoc = {
    _id: new Types.ObjectId(mockResearchId),
    contentId: new Types.ObjectId(mockContentId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    topic: "AI Video Production in 2026",
    keywords: ["ai", "video", "production"],
    researchStatus: "completed",
    summary: "Comprehensive market summary on automated production systems.",
    keyInsights: ["3x throughput increase", "Lower production costs"],
    confidenceScore: 92,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(true),
  };

  const mockSourceDoc = {
    _id: new Types.ObjectId(),
    researchId: new Types.ObjectId(mockResearchId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    url: "https://techcrunch.com/2026/01/ai-trends",
    title: "AI Video Production Breakthroughs",
    publisher: "TechCrunch",
    sourceType: "news",
    publishedAt: new Date(),
    retrievedAt: new Date(),
    reliabilityScore: 95,
  };

  const mockFactDoc = {
    _id: new Types.ObjectId(),
    researchId: new Types.ObjectId(mockResearchId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    claim: "Automated pipelines save 70% editing time.",
    sourceIds: [mockSourceDoc._id],
    status: "verified",
    confidence: 96,
    notes: "Verified by 2026 creator survey",
    save: jest.fn().mockResolvedValue(true),
  };

  const mockResearchModel = {
    findOne: jest.fn().mockResolvedValue(mockResearchDoc),
    create: jest.fn().mockResolvedValue(mockResearchDoc),
    deleteOne: jest.fn().mockResolvedValue(true),
    updateOne: jest.fn().mockResolvedValue(true),
  };

  const mockSourceModel = {
    find: jest.fn().mockResolvedValue([mockSourceDoc]),
    create: jest.fn().mockResolvedValue(mockSourceDoc),
    deleteMany: jest.fn().mockResolvedValue(true),
  };

  const mockFactModel = {
    find: jest.fn().mockResolvedValue([mockFactDoc]),
    findOne: jest.fn().mockResolvedValue(mockFactDoc),
    create: jest.fn().mockResolvedValue(mockFactDoc),
    deleteMany: jest.fn().mockResolvedValue(true),
    updateMany: jest.fn().mockResolvedValue(true),
  };

  const mockContentModel = {
    findOne: jest.fn().mockResolvedValue(mockContent),
  };

  const mockAiService = {
    generateStructuredJson: jest.fn().mockResolvedValue({
      content: {
        topic: "AI Video Production in 2026",
        keywords: ["ai", "video", "production"],
        summary: "Comprehensive market summary on automated production systems.",
        keyInsights: ["3x throughput increase", "Lower production costs"],
        confidenceScore: 92,
        sources: [
          {
            url: "https://techcrunch.com/2026/01/ai-trends",
            title: "AI Video Production Breakthroughs",
            publisher: "TechCrunch",
            sourceType: "news",
            publishedAt: "2026-01-15T00:00:00.000Z",
            reliabilityScore: 95,
          },
        ],
        facts: [
          {
            claim: "Automated pipelines save 70% editing time.",
            sourceIds: [],
            status: "verified",
            confidence: 96,
            notes: "Verified by 2026 creator survey",
          },
        ],
      },
      rawText: "{}",
      model: "gemini-1.5-pro",
      provider: "gemini",
      usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300, estimatedCostUsd: 0, durationMs: 250 },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchService,
        { provide: getModelToken(Research.name), useValue: mockResearchModel },
        { provide: getModelToken(ResearchSource.name), useValue: mockSourceModel },
        { provide: getModelToken(ResearchFact.name), useValue: mockFactModel },
        { provide: getModelToken(Content.name), useValue: mockContentModel },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<ResearchService>(ResearchService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate research with sources and verified facts", async () => {
    const result = await service.generateResearch(mockWorkspaceId, mockUserId, mockContentId);

    expect(result).toBeDefined();
    expect(result.topic).toBe("AI Video Production in 2026");
    expect(result.confidenceScore).toBe(92);
    expect(result.sources.length).toBe(1);
    expect(result.facts.length).toBe(1);
    expect(result.facts[0]?.status).toBe("verified");
  });

  it("should retrieve research package for content", async () => {
    const result = await service.getResearchByContentId(mockWorkspaceId, mockContentId);

    expect(result).toBeDefined();
    expect(result.summary).toContain("Comprehensive market summary");
    expect(result.sources[0]?.publisher).toBe("TechCrunch");
  });

  it("should update fact verification status", async () => {
    const factId = mockFactDoc._id.toString();
    const result = await service.updateFact(mockWorkspaceId, factId, {
      status: "disputed",
      notes: "Requires secondary confirmation",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("disputed");
  });
});
