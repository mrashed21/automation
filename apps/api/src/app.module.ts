import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "@nestjs/throttler";

import { HealthModule } from "./health/health.module";
import { AiModule } from "./modules/ai/ai.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AutomationModule } from "./modules/automation/automation.module";
import { ContentModule } from "./modules/content/content.module";
import { MediaAssetsModule } from "./modules/media-assets/media-assets.module";
import { PublishingModule } from "./modules/publishing/publishing.module";
import { ResearchModule } from "./modules/research/research.module";
import { ScriptModule } from "./modules/script/script.module";
import { StorageModule } from "./modules/storage/storage.module";
import { StrategyModule } from "./modules/strategy/strategy.module";
import { UsersModule } from "./modules/users/users.module";
import { WorkspacesModule } from "./modules/workspaces/workspaces.module";

@Module({
  imports: [
    // Environment configuration — loaded from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),

    // MongoDB connection (MongoDB Atlas)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>("MONGODB_URI"),
        // Connection options
        connectionFactory: (connection: {
          on: (event: string, callback: (error: unknown) => void) => void;
        }) => {
          connection.on("connected", () => {
            console.log("MongoDB connected successfully");
          });
          connection.on("error", (error: unknown) => {
            console.error("MongoDB connection error:", error);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    // Rate limiting — global guard applied via module
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>("RATE_LIMIT_TTL", 60) * 1000,
          limit: configService.get<number>("RATE_LIMIT_MAX", 100),
        },
      ],
      inject: [ConfigService],
    }),

    // Global AI Provider Abstraction & Storage
    AiModule,
    StorageModule,

    // Feature modules
    HealthModule,
    UsersModule,
    WorkspacesModule,
    AuthModule,
    ContentModule,
    ResearchModule,
    ScriptModule,
    MediaAssetsModule,
    PublishingModule,
    AutomationModule,
    AnalyticsModule,
    StrategyModule,
  ],
})
export class AppModule {}


