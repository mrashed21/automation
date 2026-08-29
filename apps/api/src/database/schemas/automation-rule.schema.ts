import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import type {
  AutomationTrigger,
  AutomationApprovalMode,
} from "@repo/types";

export type AutomationRuleDocument = HydratedDocument<AutomationRule>;

@Schema({
  collection: "automation-rules",
  timestamps: true,
})
export class AutomationRule {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: Boolean, default: true })
  isEnabled!: boolean;

  @Prop({
    type: String,
    enum: ["cron", "webhook", "manual"],
    required: true,
  })
  trigger!: AutomationTrigger;

  /** Cron expression (null for non-cron triggers) */
  @Prop({ type: String, default: null })
  cronExpression?: string | null;

  /** Target platforms for publishing */
  @Prop({ type: [String], default: [] })
  platforms!: string[];

  /** How many content items to produce per run */
  @Prop({ type: Number, default: 1 })
  dailyTarget!: number;

  @Prop({
    type: String,
    enum: ["full-auto", "approval-required", "hybrid"],
    default: "full-auto",
  })
  approvalMode!: AutomationApprovalMode;

  @Prop({ type: Date, default: null })
  lastRunAt?: Date | null;

  @Prop({ type: Date, default: null })
  nextRunAt?: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AutomationRuleSchema = SchemaFactory.createForClass(AutomationRule);

AutomationRuleSchema.index({ workspaceId: 1, isEnabled: 1 });
AutomationRuleSchema.index({ workspaceId: 1, createdAt: -1 });
