import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  AnalyticsSnapshot,
  AnalyticsSnapshotSchema,
} from "../../database/schemas/analytics-snapshot.schema";
import {
  Publication,
  PublicationSchema,
} from "../../database/schemas/publication.schema";
import {
  SocialAccount,
  SocialAccountSchema,
} from "../../database/schemas/social-account.schema";
import {
  Content,
  ContentSchema,
} from "../../database/schemas/content.schema";
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from "../../database/schemas/workspace-member.schema";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsSnapshot.name, schema: AnalyticsSnapshotSchema },
      { name: Publication.name, schema: PublicationSchema },
      { name: SocialAccount.name, schema: SocialAccountSchema },
      { name: Content.name, schema: ContentSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
