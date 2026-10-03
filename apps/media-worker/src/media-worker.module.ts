import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { QUEUE_NAMES } from "@repo/config";
import { RenderProcessor } from "./processors/render.processor";
import { FfmpegRenderService } from "./services/ffmpeg-render.service";


/**
 * Media Worker module — Phase 0 foundation.
 * FFmpeg render processors will be added in Phase 7 (Rendering).
 * This module only configures the BullMQ connection and render queue registration.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>("REDIS_URL"),
        },
        defaultJobOptions: {
          attempts: 2,
          backoff: { type: "exponential", delay: 10000 },
          // Media jobs timeout longer — FFmpeg can take minutes
          jobId: undefined,
        },
      }),
      inject: [ConfigService],
    }),

    // Media-specific queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.RENDER },
      { name: QUEUE_NAMES.MEDIA },
      { name: QUEUE_NAMES.QUALITY },
      { name: QUEUE_NAMES.COMPLIANCE },
    ),
  ],
  providers: [FfmpegRenderService, RenderProcessor],
  exports: [FfmpegRenderService],
})
export class MediaWorkerModule {}

