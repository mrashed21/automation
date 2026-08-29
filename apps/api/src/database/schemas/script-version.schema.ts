import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import { ScriptSection } from "./script.schema";

export type ScriptVersionDocument = HydratedDocument<ScriptVersion>;

@Schema({
  collection: "script-versions",
  timestamps: true,
})
export class ScriptVersion {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Script", required: true })
  scriptId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Content", required: true })
  contentId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  version!: number;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  hook!: string;

  @Prop({ type: [Object], default: [] })
  sections!: ScriptSection[];

  @Prop({ required: true })
  fullText!: string;

  @Prop({ default: 0 })
  wordCount!: number;

  @Prop({ default: "Initial version" })
  changeReason!: string;

  @Prop({ default: null })
  promptUsed?: string;

  @Prop({ default: "system" })
  provider!: string;

  @Prop({ default: "gemini-1.5-pro" })
  model!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ScriptVersionSchema = SchemaFactory.createForClass(ScriptVersion);

ScriptVersionSchema.index({ scriptId: 1, version: -1 }, { unique: true });
ScriptVersionSchema.index({ contentId: 1 });
ScriptVersionSchema.index({ workspaceId: 1, createdAt: -1 });
