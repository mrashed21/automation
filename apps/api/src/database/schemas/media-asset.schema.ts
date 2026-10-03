import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { MediaSource, MediaType } from "@repo/types";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

export type MediaAssetDocument = MediaAsset & Document;

@Schema({
  timestamps: true,
  collection: "media-assets",
})
export class MediaAsset {
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
    default: null,
    index: true,
  })
  contentId!: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ["image", "audio", "video", "thumbnail", "subtitle", "document"],
    required: true,
    index: true,
  })
  type!: MediaType;

  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: String, required: true, trim: true })
  fileName!: string;

  @Prop({ type: String, required: true, trim: true })
  mimeType!: string;

  @Prop({ type: Number, required: true })
  sizeBytes!: number;

  @Prop({ type: String, required: true, unique: true })
  storageKey!: string;

  @Prop({ type: String, required: true })
  url!: string;

  @Prop({ type: String, default: null })
  thumbnailUrl?: string | null;

  @Prop({
    type: String,
    enum: ["ai_generated", "uploaded", "stock", "rendered"],
    default: "uploaded",
  })
  source!: MediaSource;

  @Prop({ type: String, default: "Owner Reserved / Internal Asset" })
  license!: string;

  @Prop({ type: String, default: "manual-upload" })
  provider!: string;

  @Prop({ type: String, required: true })
  checksum!: string;

  @Prop({ type: Number, default: null })
  width?: number | null;

  @Prop({ type: Number, default: null })
  height?: number | null;

  @Prop({ type: Number, default: null })
  durationSeconds?: number | null;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);

// Compound indexes per plan.md section 17
MediaAssetSchema.index({ workspaceId: 1, type: 1, createdAt: -1 });
MediaAssetSchema.index({ workspaceId: 1, contentId: 1 });
