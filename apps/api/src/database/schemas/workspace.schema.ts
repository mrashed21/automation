import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";
import type { HydratedDocument } from "mongoose";
import type { AutomationMode } from "@repo/types";

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema({
  collection: "workspaces",
  timestamps: true,
})
export class Workspace {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: null })
  niche?: string;

  @Prop({ required: true, default: "en" })
  language!: string;

  @Prop({
    type: String,
    enum: ["full-auto", "approval-required", "hybrid"],
    default: "approval-required",
  })
  automationMode!: AutomationMode;

  @Prop({ required: true, default: 1, min: 1, max: 20 })
  dailyContentTarget!: number;

  @Prop({ default: false })
  isAutomationEnabled!: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true, index: true })
  ownerId!: MongooseSchema.Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
