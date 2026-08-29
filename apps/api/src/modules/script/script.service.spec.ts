import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { Content } from "../../database/schemas/content.schema";
import { ResearchFact } from "../../database/schemas/research-fact.schema";
import { Research } from "../../database/schemas/research.schema";
import { ScriptVersion } from "../../database/schemas/script-version.schema";
import { Script } from "../../database/schemas/script.schema";
import { AiService } from "../ai/ai.service";
import { ScriptService } from "./script.service";

describe("ScriptService", () => {
  let service: ScriptService;

  const mockWorkspaceId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockContentId = new Types.ObjectId().toString();
  const mockScriptId = new Types.ObjectId().toString();

  const mockContent = {
    _id: new Types.ObjectId(mockContentId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    title: "How Autonomous Workflows Save 100 Hours",
    contentType: "youtube-short",
    language: "en",
    status: "draft",
    scriptId: null,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockScriptDoc = {
    _id: new Types.ObjectId(mockScriptId),
    contentId: new Types.ObjectId(mockContentId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    currentVersion: 1,
    title: "How Autonomous Workflows Save 100 Hours",
    targetDurationSeconds: 60,
    tone: "informative",
    hook: "Stop spending 40 hours a week editing videos manually.",
    sections: [
      {
        id: new Types.ObjectId().toString(),
        order: 1,
        type: "hook",
        heading: "Hook",
        narration: "Stop spending 40 hours a week editing videos manually.",
        visualCue: "Fast pace timer countdown.",
        estimatedDurationSeconds: 5,
        wordCount: 10,
      },
      {
        id: new Types.ObjectId().toString(),
        order: 2,
        type: "body",
        heading: "Core Strategy",
        narration: "By automating research and scene composition, production turnaround drops to minutes.",
        visualCue: "Show workflow diagram.",
        estimatedDurationSeconds: 15,
        wordCount: 14,
      },
    ],
    wordCount: 24,
    estimatedDurationSeconds: 20,
    fullText: "[HOOK]\nStop spending 40 hours...",
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(true),
  };

  const mockScriptVersionDoc = {
    _id: new Types.ObjectId(),
    scriptId: new Types.ObjectId(mockScriptId),
    contentId: new Types.ObjectId(mockContentId),
    workspaceId: new Types.ObjectId(mockWorkspaceId),
    version: 1,
    title: mockScriptDoc.title,
    hook: mockScriptDoc.hook,
    sections: mockScriptDoc.sections,
    fullText: mockScriptDoc.fullText,
    wordCount: 24,
    changeReason: "Initial version",
    provider: "gemini",
    model: "gemini-1.5-pro",
    createdBy: new Types.ObjectId(mockUserId),
    createdAt: new Date(),
  };

  const mockScriptModel = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockScriptDoc),
  };

  const mockScriptVersionModel = {
    create: jest.fn().mockResolvedValue(mockScriptVersionDoc),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockScriptVersionDoc]),
    }),
  };

  const mockContentModel = {
    findOne: jest.fn().mockResolvedValue(mockContent),
  };

  const mockResearchModel = {
    findOne: jest.fn().mockResolvedValue(null),
  };

  const mockFactModel = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockAiService = {
    generateStructuredJson: jest.fn().mockResolvedValue({
      content: {
        title: "How Autonomous Workflows Save 100 Hours",
        hook: "Stop spending 40 hours a week editing videos manually.",
        targetDurationSeconds: 60,
        tone: "informative",
        sections: [
          {
            order: 1,
            type: "hook",
            heading: "Hook",
            narration: "Stop spending 40 hours a week editing videos manually.",
            visualCue: "Fast pace timer countdown.",
            estimatedDurationSeconds: 5,
          },
          {
            order: 2,
            type: "body",
            heading: "Core Strategy",
            narration: "By automating research and scene composition, production turnaround drops to minutes.",
            visualCue: "Show workflow diagram.",
            estimatedDurationSeconds: 15,
          },
        ],
      },
      rawText: "{}",
      model: "gemini-1.5-pro",
      provider: "gemini",
      usage: { promptTokens: 120, completionTokens: 180, totalTokens: 300, estimatedCostUsd: 0, durationMs: 300 },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptService,
        { provide: getModelToken(Script.name), useValue: mockScriptModel },
        { provide: getModelToken(ScriptVersion.name), useValue: mockScriptVersionModel },
        { provide: getModelToken(Content.name), useValue: mockContentModel },
        { provide: getModelToken(Research.name), useValue: mockResearchModel },
        { provide: getModelToken(ResearchFact.name), useValue: mockFactModel },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<ScriptService>(ScriptService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate a structured script and record immutable version", async () => {
    const result = await service.generateScript(mockWorkspaceId, mockUserId, mockContentId, {
      tone: "informative",
      targetDurationSeconds: 60,
    });

    expect(result).toBeDefined();
    expect(result.hook).toBe("Stop spending 40 hours a week editing videos manually.");
    expect(result.sections.length).toBe(2);
    expect(mockScriptVersionModel.create).toHaveBeenCalled();
  });

  it("should retrieve script revision history", async () => {
    const versions = await service.getScriptVersions(mockWorkspaceId, mockContentId);

    expect(versions).toBeDefined();
    expect(versions.length).toBe(1);
    expect(versions[0]?.version).toBe(1);
  });
});
