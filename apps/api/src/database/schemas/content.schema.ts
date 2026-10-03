import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { ComplianceStatus, ContentStatus, ContentType } from "@repo/types";
import type { HydratedDocument } from "mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";

export type ContentDocument = HydratedDocument<Content>;

@Schema({
  collection: "content",
  timestamps: true,
})
export class Content {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: null })
  description?: string;

  @Prop({
    type: String,
    enum: ["youtube-long", "youtube-short", "facebook-video", "facebook-reel"],
    required: true,
    index: true,
  })
  contentType!: ContentType;

  @Prop({ required: true, default: "en" })
  language!: string;

  @Prop({ default: null })
  niche?: string;

  @Prop({
    type: String,
    enum: [
      "draft",
      "researching",
      "scripting",
      "fact-checking",
      "media-sourcing",
      "voice-generating",
      "rendering",
      "quality-check",
      "compliance-check",
      "ready",
      "scheduled",
      "publishing",
      "published",
      "failed",
      "archived",
    ],
    default: "draft",
    index: true,
  })
  status!: ContentStatus;

  @Prop({ required: true, default: 1 })
  currentVersion!: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Script", default: null })
  scriptId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "MediaAsset", default: null })
  thumbnailAssetId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "MediaAsset", default: null })
  videoAssetId?: Types.ObjectId;

  @Prop({ default: null })
  strategyId?: string;

  @Prop({ default: null })
  qualityScore?: number;

  @Prop({
    type: String,
    enum: ["pending", "approved", "rejected", "requires-review"],
    default: "pending",
  })
  complianceStatus!: ComplianceStatus;

  @Prop({ type: Date, default: null })
  scheduledAt?: Date;

  @Prop({ type: Date, default: null })
  publishedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", default: null })
  updatedBy?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ContentSchema = SchemaFactory.createForClass(Content);

// Compound indexes according to actual query patterns per plan.md section 17
ContentSchema.index({ workspaceId: 1, status: 1 });
ContentSchema.index({ workspaceId: 1, createdAt: -1 });
ContentSchema.index({ workspaceId: 1, publishedAt: -1 });
