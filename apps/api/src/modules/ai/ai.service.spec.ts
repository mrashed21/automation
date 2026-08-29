import { Test, TestingModule } from "@nestjs/testing";
import { AiService } from "./ai.service";
import { GeminiTextProvider } from "./providers/gemini-text.provider";
import { MockImageProvider } from "./providers/mock-image.provider";
import { MockVoiceProvider } from "./providers/mock-voice.provider";
import { z } from "zod";

describe("AiService", () => {
  let service: AiService;
  let textProvider: GeminiTextProvider;

  const mockSchema = z.object({
    title: z.string(),
    score: z.number(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: GeminiTextProvider,
          useValue: {
            generateText: jest.fn().mockResolvedValue({
              content: "Generated sample text output",
              rawText: "Generated sample text output",
              model: "gemini-1.5-pro",
              provider: "gemini",
              usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30, estimatedCostUsd: 0, durationMs: 150 },
            }),
            generateStructuredJson: jest.fn().mockResolvedValue({
              content: { title: "Automated Workflow", score: 95 },
              rawText: JSON.stringify({ title: "Automated Workflow", score: 95 }),
              model: "gemini-1.5-pro",
              provider: "gemini",
              usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40, estimatedCostUsd: 0, durationMs: 200 },
            }),
          },
        },
        {
          provide: MockImageProvider,
          useValue: {
            generateImage: jest.fn().mockResolvedValue({
              imageUrl: "https://example.com/image.jpg",
              promptUsed: "modern studio",
              model: "imagen-3",
              provider: "mock-image",
              usage: { promptTokens: 5, completionTokens: 0, totalTokens: 5, estimatedCostUsd: 0.02, durationMs: 500 },
            }),
          },
        },
        {
          provide: MockVoiceProvider,
          useValue: {
            generateVoice: jest.fn().mockResolvedValue({
              audioUrl: "https://example.com/audio.mp3",
              durationSeconds: 15,
              model: "eleven_multilingual_v2",
              provider: "mock-voice",
              usage: { promptTokens: 50, completionTokens: 0, totalTokens: 50, estimatedCostUsd: 0.0015, durationMs: 400 },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    textProvider = module.get<GeminiTextProvider>(GeminiTextProvider);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate text via provider", async () => {
    const result = await service.generateText("Test prompt");
    expect(result.content).toBe("Generated sample text output");
    expect(textProvider.generateText).toHaveBeenCalledWith("Test prompt", undefined);
  });

  it("should generate and validate structured JSON using Zod schema", async () => {
    const result = await service.generateStructuredJson(
      "Extract topic",
      mockSchema,
      `{ "title": "string", "score": number }`,
    );

    expect(result.content).toEqual({ title: "Automated Workflow", score: 95 });
    expect(result.content.title).toBe("Automated Workflow");
  });

  it("should generate image asset metadata", async () => {
    const image = await service.generateImage("Modern thumbnail");
    expect(image.imageUrl).toContain("https://example.com/image.jpg");
    expect(image.provider).toBe("mock-image");
  });

  it("should generate voice narration audio metadata", async () => {
    const voice = await service.generateVoice("Welcome to the video");
    expect(voice.durationSeconds).toBe(15);
    expect(voice.audioUrl).toBe("https://example.com/audio.mp3");
  });
});
