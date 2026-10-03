import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { ResearchStatus } from "@repo/types";
import type { HydratedDocument } from "mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";

export type ResearchDocument = HydratedDocument<Research>;

@Schema({
  collection: "researches",
  timestamps: true,
})
export class Research {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Content", required: true })
  contentId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  topic!: string;

  @Prop({ type: [String], default: [] })
  keywords!: string[];

  @Prop({
    type: String,
    enum: ["pending", "researching", "completed", "failed"],
    default: "pending",
    index: true,
  })
  researchStatus!: ResearchStatus;

  @Prop({ default: "" })
  summary!: string;

  @Prop({ type: [String], default: [] })
  keyInsights!: string[];

  @Prop({ default: 0, min: 0, max: 100 })
  confidenceScore!: number;

  @Prop({ type: Date, default: null })
  completedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResearchSchema = SchemaFactory.createForClass(Research);

ResearchSchema.index({ workspaceId: 1, contentId: 1 });
ResearchSchema.index({ workspaceId: 1, createdAt: -1 });
