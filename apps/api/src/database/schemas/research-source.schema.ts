import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";

export type ResearchSourceDocument = HydratedDocument<ResearchSource>;

@Schema({
  collection: "research-sources",
  timestamps: true,
})
export class ResearchSource {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Research", required: true })
  researchId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  publisher!: string;

  @Prop({
    type: String,
    enum: ["news", "academic", "official", "industry", "encyclopedia", "other"],
    default: "other",
  })
  sourceType!: string;

  @Prop({ type: Date, default: null })
  publishedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  retrievedAt!: Date;

  @Prop({ default: 80, min: 0, max: 100 })
  reliabilityScore!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResearchSourceSchema = SchemaFactory.createForClass(ResearchSource);

ResearchSourceSchema.index({ researchId: 1 });
ResearchSourceSchema.index({ workspaceId: 1 });
