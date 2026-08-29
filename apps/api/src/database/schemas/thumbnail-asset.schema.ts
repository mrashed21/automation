import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type ThumbnailAssetDocument = ThumbnailAsset & Document;

@Schema({
  timestamps: true,
  collection: "thumbnail-assets",
})
export class ThumbnailAsset {
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
    ref: "MediaAsset",
    required: true,
  })
  mediaAssetId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  prompt!: string;

  @Prop({
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true,
  })
  variant!: "A" | "B" | "C" | "D";

  @Prop({ type: String, default: "" })
  headlineText?: string;

  @Prop({ type: String, default: "youtube_high_ctr" })
  style!: string;

  @Prop({ type: Number, default: 85 })
  ctrScoreEstimate!: number;

  @Prop({
    type: String,
    enum: ["generating", "ready", "selected", "rejected"],
    default: "ready",
  })
  status!: "generating" | "ready" | "selected" | "rejected";

  createdAt!: Date;
  updatedAt!: Date;
}

export const ThumbnailAssetSchema = SchemaFactory.createForClass(ThumbnailAsset);

ThumbnailAssetSchema.index({ contentId: 1, variant: 1 }, { unique: true });
ThumbnailAssetSchema.index({ workspaceId: 1, status: 1 });
