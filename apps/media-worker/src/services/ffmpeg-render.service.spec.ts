import { Test, TestingModule } from "@nestjs/testing";
import * as fs from "fs";
import * as path from "path";
import { FfmpegRenderService } from "./ffmpeg-render.service";

describe("FfmpegRenderService", () => {
  let service: FfmpegRenderService;
  const testOutputDir = path.resolve(__dirname, "../../test-output");
  const testOutputFile = path.join(testOutputDir, "test-render.mp4");

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FfmpegRenderService],
    }).compile();

    service = module.get<FfmpegRenderService>(FfmpegRenderService);
  });

  afterAll(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it("should resolve correct dimensions for 16:9 and 9:16 aspect ratios", () => {
    expect(service.resolveDimensions("16:9", "1080p")).toEqual({
      width: 1920,
      height: 1080,
    });
    expect(service.resolveDimensions("9:16", "1080p")).toEqual({
      width: 1080,
      height: 1920,
    });
    expect(service.resolveDimensions("16:9", "720p")).toEqual({
      width: 1280,
      height: 720,
    });
  });

  it("should generate ASS subtitles markup with safe margins for 9:16 vertical shorts", () => {
    const ass = service.generateAssSubtitles(
      [
        {
          startTimeMs: 1000,
          endTimeMs: 4000,
          text: "Accelerate content generation with AI.",
          highlightWord: "Accelerate",
        },
      ],
      "9:16",
      "highlight_pop",
    );

    expect(ass).toContain("[Script Info]");
    expect(ass).toContain("PlayResX: 1080");
    expect(ass).toContain("PlayResY: 1920");
    expect(ass).toContain("Dialogue: 0,0:00:01.00,0:00:04.00");
    expect(ass).toContain("{\\c&H0024E6FF\\b1}Accelerate{\\r}");
  });

  it("should render video output file and report progress stages", async () => {
    const progressUpdates: number[] = [];

    const result = await service.renderVideo(
      {
        aspectRatio: "16:9",
        resolution: "1080p",
        scenes: [
          { index: 0, title: "Intro", durationSeconds: 5 },
          { index: 1, title: "Body", durationSeconds: 15 },
        ],
        subtitles: [
          {
            startTimeMs: 0,
            endTimeMs: 5000,
            text: "Welcome to automated video generation.",
          },
        ],
        outputPath: testOutputFile,
      },
      (percent) => {
        progressUpdates.push(percent);
      },
    );

    expect(result).toBeDefined();
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
    expect(result.durationSeconds).toBe(20);
    expect(progressUpdates).toContain(100);
    expect(fs.existsSync(testOutputFile)).toBe(true);
  });
});
