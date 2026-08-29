import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import type { OpportunityStatus } from "@repo/types";

export type StrategyRecommendationDocument = HydratedDocument<StrategyRecommendation>;

@Schema({
  collection: "strategy-recommendations",
  timestamps: true,
})
export class StrategyRecommendation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  topic!: string;

  @Prop({ type: String, required: true })
  rationale!: string;

  @Prop({ type: [String], default: [] })
  suggestedHooks!: string[];

  @Prop({ type: String, enum: ["shorts", "long-form"], required: true })
  format!: "shorts" | "long-form";

  @Prop({ type: String, default: null })
  niche?: string | null;

  @Prop({ type: [String], default: [] })
  keywords!: string[];

  @Prop({ type: Number, required: true, min: 0, max: 100, default: 75 })
  estimatedScore!: number;

  @Prop({
    type: String,
    enum: ["suggested", "accepted", "rejected", "in-production", "published"],
    default: "suggested",
    index: true,
  })
  status!: OpportunityStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Content", default: null })
  contentId?: Types.ObjectId | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const StrategyRecommendationSchema = SchemaFactory.createForClass(StrategyRecommendation);

StrategyRecommendationSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
StrategyRecommendationSchema.index({ workspaceId: 1, estimatedScore: -1 });
