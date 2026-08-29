import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MediaAsset, MediaAssetSchema } from "../../database/schemas/media-asset.schema";
import { ThumbnailAsset, ThumbnailAssetSchema } from "../../database/schemas/thumbnail-asset.schema";
import { VoiceAsset, VoiceAssetSchema } from "../../database/schemas/voice-asset.schema";
import { Content, ContentSchema } from "../../database/schemas/content.schema";
import { Script, ScriptSchema } from "../../database/schemas/script.schema";
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from "../../database/schemas/workspace-member.schema";
import { MediaAssetsService } from "./media-assets.service";
import { MediaAssetsController } from "./media-assets.controller";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaAsset.name, schema: MediaAssetSchema },
      { name: ThumbnailAsset.name, schema: ThumbnailAssetSchema },
      { name: VoiceAsset.name, schema: VoiceAssetSchema },
      { name: Content.name, schema: ContentSchema },
      { name: Script.name, schema: ScriptSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
    AiModule,
  ],
  controllers: [MediaAssetsController],
  providers: [MediaAssetsService],
  exports: [MediaAssetsService],
})
export class MediaAssetsModule {}
