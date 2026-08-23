import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "./health.controller";
import { RedisHealthIndicator } from "./redis-health.indicator";

@Module({
  imports: [TerminusModule, MongooseModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
