import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type VoiceAssetDocument = VoiceAsset & Document;

@Schema({
  timestamps: true,
  collection: "voice-assets",
})
export class VoiceAsset {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true,
  })
  workspaceId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Content",
    required: true,
    index: true,
  })
  contentId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Script",
    default: null,
  })
  scriptId?: Types.ObjectId | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "MediaAsset",
    required: true,
  })
  mediaAssetId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  voiceId!: string;

  @Prop({ type: String, required: true })
  voiceName!: string;

  @Prop({ type: String, default: "elevenlabs" })
  provider!: string;

  @Prop({ type: Number, required: true })
  durationSeconds!: number;

  @Prop({ type: Number, default: 44100 })
  sampleRate!: number;

  @Prop({ type: String, default: "audio/mpeg" })
  audioFormat!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const VoiceAssetSchema = SchemaFactory.createForClass(VoiceAsset);

VoiceAssetSchema.index({ contentId: 1, createdAt: -1 });
VoiceAssetSchema.index({ workspaceId: 1, contentId: 1 });
