import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import type { ContentType } from "@repo/types";

export type ContentVersionDocument = HydratedDocument<ContentVersion>;

@Schema({
  collection: "content-versions",
  timestamps: true,
})
export class ContentVersion {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Content", required: true, index: true })
  contentId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  version!: number;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: null })
  description?: string;

  @Prop({
    type: String,
    enum: ["youtube-long", "youtube-short", "facebook-video", "facebook-reel"],
    required: true,
  })
  contentType!: ContentType;

  @Prop({ required: true, default: "en" })
  language!: string;

  @Prop({ default: null })
  niche?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Script", default: null })
  scriptId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "MediaAsset", default: null })
  thumbnailAssetId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "MediaAsset", default: null })
  videoAssetId?: Types.ObjectId;

  @Prop({ default: "Initial version" })
  changeReason?: string;

  @Prop({ default: "user" })
  source!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ContentVersionSchema = SchemaFactory.createForClass(ContentVersion);

// Compound index for fast version history retrieval and uniqueness per version
ContentVersionSchema.index({ contentId: 1, version: -1 }, { unique: true });
ContentVersionSchema.index({ workspaceId: 1, createdAt: -1 });
