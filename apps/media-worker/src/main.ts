import { NestFactory } from "@nestjs/core";

import { MediaWorkerModule } from "./media-worker.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(MediaWorkerModule, {
    logger: ["error", "warn", "log", "debug"],
  });

  // Media workers don't expose HTTP — they consume BullMQ render queues
  await app.init();

  console.log("media-worker started and processing render queues");

  process.on("SIGTERM", async () => {
    console.log("Media worker received SIGTERM — shutting down gracefully");
    await app.close();
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start media-worker:", error);
  process.exit(1);
});
