import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type {
  PublishingPlatform,
  PublicationPrivacy,
  SocialPublishingStatus,
} from "@repo/types";

export type PublicationDocument = Publication & Document;

@Schema({ timestamps: true, collection: "publications" })
export class Publication {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Content", required: true, index: true })
  contentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "SocialAccount", required: true })
  socialAccountId!: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ["youtube", "facebook", "instagram", "tiktok"] })
  platform!: PublishingPlatform;

  @Prop({ required: true })
  accountName!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ default: "" })
  description!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, type: String, enum: ["public", "unlisted", "private"], default: "public" })
  privacyStatus!: PublicationPrivacy;

  @Prop({ default: "28" })
  category?: string;

  @Prop({
    required: true,
    type: String,
    enum: ["draft", "scheduled", "publishing", "published", "failed"],
    default: "draft",
  })
  status!: SocialPublishingStatus;

  @Prop({ default: null })
  scheduledAt?: Date;

  @Prop({ default: null })
  publishedAt?: Date;

  @Prop({ default: null })
  externalPostId?: string;

  @Prop({ default: null })
  externalUrl?: string;

  @Prop({ default: null })
  errorMessage?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);

PublicationSchema.index({ workspaceId: 1, contentId: 1 });
PublicationSchema.index({ workspaceId: 1, platform: 1, status: 1 });
PublicationSchema.index({ scheduledAt: 1, status: 1 });
