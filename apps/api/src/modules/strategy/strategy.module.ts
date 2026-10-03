import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  AnalyticsSnapshot,
  AnalyticsSnapshotSchema,
} from "../../database/schemas/analytics-snapshot.schema";
import {
  Content,
  ContentSchema,
} from "../../database/schemas/content.schema";
import {
  StrategyRecommendation,
  StrategyRecommendationSchema,
} from "../../database/schemas/strategy-recommendation.schema";
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from "../../database/schemas/workspace-member.schema";
import { AiModule } from "../ai/ai.module";
import { StrategyController } from "./strategy.controller";
import { StrategyService } from "./strategy.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StrategyRecommendation.name, schema: StrategyRecommendationSchema },
      { name: Content.name, schema: ContentSchema },
      { name: AnalyticsSnapshot.name, schema: AnalyticsSnapshotSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
    AiModule,
  ],
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}
