import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { WorkerModule } from "./worker.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WorkerModule, {
    logger: ["error", "warn", "log", "debug"],
  });

  const configService = app.get(ConfigService);
  const workerName = "worker";

  // Workers don't expose HTTP — they consume BullMQ queues
  await app.init();

  console.log(`${workerName} started and processing queues`);

  // Attach shutdown hooks for graceful BullMQ drain
  configService.get("NODE_ENV"); // ensure config is loaded
  process.on("SIGTERM", async () => {
    console.log("Worker received SIGTERM — shutting down gracefully");
    await app.close();
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
