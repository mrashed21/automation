import dns from "node:dns";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

// Ensure Node.js uses standard reliable DNS resolvers for MongoDB Atlas SRV lookups on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Use structured logging; configure pino logger in production
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("API_PORT", 3001);
  const corsOrigins = configService.get<string>("API_CORS_ORIGINS", "http://localhost:3000");

  // Normalize duplicate slashes in URLs (e.g., //api/v1 -> /api/v1)
  app.use((req: { url: string }, _res: unknown, next: () => void) => {
    if (req.url && req.url.includes("//")) {
      req.url = req.url.replace(/\/+/g, "/");
    }
    next();
  });

  // Cookie parser for secure HttpOnly refresh token cookies
  app.use(cookieParser());

  // Global prefix for all routes
  app.setGlobalPrefix("api/v1");

  // CORS
  app.enableCors({
    origin: corsOrigins.split(",").map((origin) => origin.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // Global validation pipe — validates all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter — normalizes all errors to the standard response shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger API documentation (development only)
  if (configService.get("NODE_ENV") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("AI Content Automation Platform API")
      .setDescription("REST API for the AI Content Automation Platform")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start API server:", error);
  process.exit(1);
});
