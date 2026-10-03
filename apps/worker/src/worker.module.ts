import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { QUEUE_NAMES } from "@repo/config";

/**
 * Worker module — Phase 0 foundation.
 * Queue processors will be added in Phase 4+ (Research, Script, Publishing, etc.)
 * This module only configures the BullMQ connection for now.
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
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
        },
      }),
      inject: [ConfigService],
    }),

    // Register queues this worker will process
    // Processors are added per-phase when implementing each feature
    BullModule.registerQueue(
      { name: QUEUE_NAMES.RESEARCH },
      { name: QUEUE_NAMES.SCRIPT },
      { name: QUEUE_NAMES.FACT_CHECK },
      { name: QUEUE_NAMES.VOICE },
      { name: QUEUE_NAMES.THUMBNAIL },
      { name: QUEUE_NAMES.PUBLISH },
      { name: QUEUE_NAMES.ANALYTICS },
      { name: QUEUE_NAMES.STRATEGY },
      { name: QUEUE_NAMES.NOTIFICATIONS },
    ),
  ],
})
export class WorkerModule {}
