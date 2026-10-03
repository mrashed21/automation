import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { PublishingPlatform } from "@repo/types";
import type { HydratedDocument } from "mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";

export type AnalyticsSnapshotDocument = HydratedDocument<AnalyticsSnapshot>;

@Schema({
  collection: "analytics-snapshots",
  timestamps: true,
})
export class AnalyticsSnapshot {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Content", required: true, index: true })
  contentId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Publication", default: null })
  publicationId?: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ["youtube", "facebook", "instagram", "tiktok"],
    required: true,
  })
  platform!: PublishingPlatform;

  @Prop({ type: Date, required: true, index: true })
  capturedAt!: Date;

  @Prop({ type: Number, default: 0 })
  views!: number;

  @Prop({ type: Number, default: 0 })
  likes!: number;

  @Prop({ type: Number, default: 0 })
  comments!: number;

  @Prop({ type: Number, default: 0 })
  shares!: number;

  /** Total watch time in seconds */
  @Prop({ type: Number, default: null })
  watchTimeSeconds?: number | null;

  /** Average view duration in seconds */
  @Prop({ type: Number, default: null })
  averageViewDurationSeconds?: number | null;

  /** Retention percentage (0-100) */
  @Prop({ type: Number, default: null })
  retentionPercent?: number | null;

  /** Click-through rate percentage */
  @Prop({ type: Number, default: null })
  clickThroughRate?: number | null;

  /** Subscribers / followers gained from this content */
  @Prop({ type: Number, default: null })
  subscribersGained?: number | null;

  @Prop({ type: Number, default: null })
  followersGained?: number | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AnalyticsSnapshotSchema =
  SchemaFactory.createForClass(AnalyticsSnapshot);

AnalyticsSnapshotSchema.index({ contentId: 1, capturedAt: -1 });
AnalyticsSnapshotSchema.index({ workspaceId: 1, capturedAt: -1 });
AnalyticsSnapshotSchema.index({ contentId: 1, platform: 1, capturedAt: -1 });
