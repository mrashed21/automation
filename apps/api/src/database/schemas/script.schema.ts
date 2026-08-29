import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import type { ScriptSectionType } from "@repo/types";

export type ScriptDocument = HydratedDocument<Script>;

@Schema({ _id: false })
export class ScriptSection {
  @Prop({ type: String, default: () => new Types.ObjectId().toString() })
  id!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({
    type: String,
    enum: ["hook", "intro", "body", "climax", "call-to-action", "outro"],
    required: true,
  })
  type!: ScriptSectionType;

  @Prop({ required: true, trim: true })
  heading!: string;

  @Prop({ required: true })
  narration!: string;

  @Prop({ default: "" })
  visualCue!: string;

  @Prop({ default: 0 })
  estimatedDurationSeconds!: number;

  @Prop({ default: 0 })
  wordCount!: number;
}

const ScriptSectionSchema = SchemaFactory.createForClass(ScriptSection);

@Schema({
  collection: "scripts",
  timestamps: true,
})
export class Script {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Content", required: true })
  contentId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  currentVersion!: number;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, default: 60 })
  targetDurationSeconds!: number;

  @Prop({
    type: String,
    enum: ["informative", "dramatic", "energetic", "casual", "analytical"],
    default: "informative",
  })
  tone!: string;

  @Prop({ required: true })
  hook!: string;

  @Prop({ type: [ScriptSectionSchema], default: [] })
  sections!: ScriptSection[];

  @Prop({ default: 0 })
  wordCount!: number;

  @Prop({ default: 0 })
  estimatedDurationSeconds!: number;

  @Prop({ default: "" })
  fullText!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", default: null })
  updatedBy?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ScriptSchema = SchemaFactory.createForClass(Script);

ScriptSchema.index({ workspaceId: 1, contentId: 1 });
ScriptSchema.index({ workspaceId: 1, createdAt: -1 });
