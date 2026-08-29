import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import * as path from "path";
import { QUEUE_NAMES } from "@repo/config";
import type { RenderJobPayload, RenderJobResult } from "@repo/types";
import { FfmpegRenderService } from "../services/ffmpeg-render.service";

@Processor(QUEUE_NAMES.RENDER)
export class RenderProcessor extends WorkerHost {
  private readonly logger = new Logger(RenderProcessor.name);

  constructor(private readonly ffmpegRenderService: FfmpegRenderService) {
    super();
  }

  async process(job: Job<RenderJobPayload>): Promise<RenderJobResult> {
    const payload = job.data;
    this.logger.log(
      `Processing render job #${job.id} for content ${payload.contentId} in workspace ${payload.workspaceId}`,
    );

    await job.updateProgress(10);

    const outputDir = path.resolve(process.cwd(), "uploads", "renders");
    const outputFilename = `render_${payload.contentId}_${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    const result = await this.ffmpegRenderService.renderVideo(
      {
        aspectRatio: payload.aspectRatio || "16:9",
        resolution: payload.resolution || "1080p",
        scenes: [
          {
            index: 0,
            title: "Intro Hook",
            durationSeconds: 10,
          },
          {
            index: 1,
            title: "Main Key Takeaway",
            durationSeconds: 25,
          },
          {
            index: 2,
            title: "Call to Action",
            durationSeconds: 10,
          },
        ],
        subtitles: payload.includeSubtitles
          ? [
              {
                startTimeMs: 500,
                endTimeMs: 3000,
                text: "Unlock the power of autonomous AI pipelines today.",
                highlightWord: "autonomous",
              },
              {
                startTimeMs: 3500,
                endTimeMs: 7000,
                text: "Scale your reach across short-form and long-form channels effortlessly.",
                highlightWord: "effortlessly",
              },
            ]
          : [],
        subtitleStyle: payload.subtitleStyle,
        includeMusic: payload.includeMusic,
        musicVolume: payload.musicVolume,
        outputPath,
      },
      (percent, step) => {
        void job.updateProgress(percent);
        this.logger.debug(`Render Job #${job.id} [${percent}%]: ${step}`);
      },

    );

    await job.updateProgress(100);
    this.logger.log(`Render job #${job.id} completed successfully`);

    return result;
  }
}
