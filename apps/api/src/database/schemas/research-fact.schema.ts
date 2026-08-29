import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import type { FactVerificationStatus } from "@repo/types";

export type ResearchFactDocument = HydratedDocument<ResearchFact>;

@Schema({
  collection: "research-facts",
  timestamps: true,
})
export class ResearchFact {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Research", required: true })
  researchId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  claim!: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "ResearchSource" }], default: [] })
  sourceIds!: Types.ObjectId[];

  @Prop({
    type: String,
    enum: ["verified", "unverified", "disputed", "rejected"],
    default: "unverified",
    index: true,
  })
  status!: FactVerificationStatus;

  @Prop({ default: 80, min: 0, max: 100 })
  confidence!: number;

  @Prop({ default: null })
  notes?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResearchFactSchema = SchemaFactory.createForClass(ResearchFact);

ResearchFactSchema.index({ researchId: 1, status: 1 });
ResearchFactSchema.index({ workspaceId: 1 });
