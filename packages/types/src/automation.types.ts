import type { Nullable } from "./common.types";

/** Trigger type for an automation rule */
export type AutomationTrigger = "cron" | "webhook" | "manual";

/** Approval mode for autonomous content pipeline */
export type AutomationApprovalMode =
  | "full-auto"
  | "approval-required"
  | "hybrid";

/** Run status for an automation pipeline execution */
export type AutomationRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/** Stage name in the content production pipeline */
export type PipelineStageName =
  | "research"
  | "script"
  | "media"
  | "render"
  | "quality-check"
  | "publish";

/** Stage progress record */
export interface PipelineStageDto {
  stage: PipelineStageName;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt: Nullable<string>;
  completedAt: Nullable<string>;
  durationMs: Nullable<number>;
  jobId: Nullable<string>;
  errorMessage: Nullable<string>;
}

/** Automation Rule DTO — defines how and when content is automatically produced */
export interface AutomationRuleDto {
  id: string;
  workspaceId: string;
  name: string;
  isEnabled: boolean;
  trigger: AutomationTrigger;
  /** Cron expression (e.g. '0 9 * * *') — only used when trigger='cron' */
  cronExpression: Nullable<string>;
  /** Target platforms for publishing */
  platforms: string[];
  /** Target number of content items to produce per run */
  dailyTarget: number;
  approvalMode: AutomationApprovalMode;
  lastRunAt: Nullable<string>;
  nextRunAt: Nullable<string>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Automation Run DTO — one execution of an automation rule */
export interface AutomationRunDto {
  id: string;
  ruleId: string;
  workspaceId: string;
  contentId: Nullable<string>;
  status: AutomationRunStatus;
  triggeredBy: "cron" | "webhook" | "manual" | "api";
  stages: PipelineStageDto[];
  startedAt: string;
  completedAt: Nullable<string>;
  durationMs: Nullable<number>;
  errorMessage: Nullable<string>;
}

/** Payload dispatched to the automation queue */
export interface AutomationJobPayload {
  runId: string;
  ruleId: string;
  workspaceId: string;
  platforms: string[];
  dailyTarget: number;
  approvalMode: AutomationApprovalMode;
}

/** Workspace automation status summary */
export interface AutomationStatusDto {
  isRunning: boolean;
  totalRules: number;
  enabledRules: number;
  lastRunAt: Nullable<string>;
  successfulRunsToday: number;
  failedRunsToday: number;
  queuedJobs: number;
}
