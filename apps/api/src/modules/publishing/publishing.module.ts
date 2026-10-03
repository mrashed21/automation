import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Content, ContentSchema } from "../../database/schemas/content.schema";
import {
  MediaAsset,
  MediaAssetSchema,
} from "../../database/schemas/media-asset.schema";
import {
  Publication,
  PublicationSchema,
} from "../../database/schemas/publication.schema";
import {
  SocialAccount,
  SocialAccountSchema,
} from "../../database/schemas/social-account.schema";
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from "../../database/schemas/workspace-member.schema";
import { FacebookPublisher } from "./adapters/facebook.publisher";
import { YouTubePublisher } from "./adapters/youtube.publisher";
import { PublishingController } from "./publishing.controller";
import { PublishingService } from "./publishing.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialAccount.name, schema: SocialAccountSchema },
      { name: Publication.name, schema: PublicationSchema },
      { name: Content.name, schema: ContentSchema },
      { name: MediaAsset.name, schema: MediaAssetSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
  ],
  controllers: [PublishingController],
  providers: [PublishingService, YouTubePublisher, FacebookPublisher],
  exports: [PublishingService],
})
export class PublishingModule {}
