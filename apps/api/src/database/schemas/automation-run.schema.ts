import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type {
  AutomationRunStatus,
  PipelineStageName,
} from "@repo/types";
import type { HydratedDocument } from "mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";

export type AutomationRunDocument = HydratedDocument<AutomationRun>;

/** Embedded stage record inside a run */
export class PipelineStage {
  @Prop({ type: String, required: true })
  stage!: PipelineStageName;

  @Prop({
    type: String,
    enum: ["pending", "running", "completed", "failed", "skipped"],
    default: "pending",
  })
  status!: "pending" | "running" | "completed" | "failed" | "skipped";

  @Prop({ type: Date, default: null })
  startedAt?: Date | null;

  @Prop({ type: Date, default: null })
  completedAt?: Date | null;

  @Prop({ type: Number, default: null })
  durationMs?: number | null;

  @Prop({ type: String, default: null })
  jobId?: string | null;

  @Prop({ type: String, default: null })
  errorMessage?: string | null;
}

export const PipelineStageSchema = SchemaFactory.createForClass(PipelineStage);

@Schema({
  collection: "automation-runs",
  timestamps: true,
})
export class AutomationRun {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "AutomationRule", required: true, index: true })
  ruleId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  /** Content item being produced in this run (null until assigned) */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Content", default: null })
  contentId?: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ["queued", "running", "completed", "failed", "cancelled"],
    default: "queued",
    index: true,
  })
  status!: AutomationRunStatus;

  @Prop({
    type: String,
    enum: ["cron", "webhook", "manual", "api"],
    required: true,
  })
  triggeredBy!: "cron" | "webhook" | "manual" | "api";

  @Prop({ type: [PipelineStageSchema], default: [] })
  stages!: PipelineStage[];

  @Prop({ type: Date, required: true })
  startedAt!: Date;

  @Prop({ type: Date, default: null })
  completedAt?: Date | null;

  @Prop({ type: Number, default: null })
  durationMs?: number | null;

  @Prop({ type: String, default: null })
  errorMessage?: string | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AutomationRunSchema = SchemaFactory.createForClass(AutomationRun);

AutomationRunSchema.index({ workspaceId: 1, status: 1 });
AutomationRunSchema.index({ workspaceId: 1, createdAt: -1 });
AutomationRunSchema.index({ ruleId: 1, createdAt: -1 });
