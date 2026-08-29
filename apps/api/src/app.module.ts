import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "@nestjs/throttler";

import { HealthModule } from "./health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { WorkspacesModule } from "./modules/workspaces/workspaces.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [
    // Environment configuration — loaded from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
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

    // Feature modules
    HealthModule,
    UsersModule,
    WorkspacesModule,
    AuthModule,
  ],
})
export class AppModule {}
