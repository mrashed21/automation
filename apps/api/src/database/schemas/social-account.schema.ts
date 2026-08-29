import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { PublishingPlatform } from "@repo/types";

export type SocialAccountDocument = SocialAccount & Document;

@Schema({ timestamps: true, collection: "social_accounts" })
export class SocialAccount {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ["youtube", "facebook", "instagram", "tiktok"] })
  platform!: PublishingPlatform;

  @Prop({ required: true })
  accountName!: string;

  @Prop({ required: true })
  accountId!: string;

  @Prop({ default: null })
  avatarUrl?: string;

  @Prop({ required: true, default: true })
  isConnected!: boolean;

  @Prop({ default: "" })
  accessToken!: string;

  @Prop({ default: "" })
  refreshToken?: string;

  @Prop({ type: [String], default: [] })
  scopes!: string[];

  @Prop({ default: null })
  tokenExpiresAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SocialAccountSchema = SchemaFactory.createForClass(SocialAccount);

// Compound index: Unique accountId per workspace & platform
SocialAccountSchema.index({ workspaceId: 1, platform: 1, accountId: 1 }, { unique: true });
SocialAccountSchema.index({ workspaceId: 1, isConnected: 1 });
