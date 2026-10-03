import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import type {
  AutomationRuleDto,
  AutomationRunDto,
  AutomationStatusDto,
} from "@repo/types";
import type {
  CreateAutomationRuleDto,
  UpdateAutomationRuleDto,
} from "@repo/validation";
import * as crypto from "crypto";
import { Model, Types } from "mongoose";
import {
  AutomationRule,
  AutomationRuleDocument,
} from "../../database/schemas/automation-rule.schema";
import {
  AutomationRun,
  AutomationRunDocument,
} from "../../database/schemas/automation-run.schema";

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectModel(AutomationRule.name)
    private readonly ruleModel: Model<AutomationRuleDocument>,
    @InjectModel(AutomationRun.name)
    private readonly runModel: Model<AutomationRunDocument>,
    private readonly configService: ConfigService,
  ) {}

  // ─── Rules ───────────────────────────────────────────────────────────────

  async findAllRules(workspaceId: string): Promise<AutomationRuleDto[]> {
    const rules = await this.ruleModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return rules.map((r) => this.mapRule(r));
  }

  async createRule(
    workspaceId: string,
    userId: string,
    dto: CreateAutomationRuleDto,
  ): Promise<AutomationRuleDto> {
    if (dto.trigger === "cron" && !dto.cronExpression) {
      throw new BadRequestException(
        "cronExpression is required for cron trigger",
      );
    }

    const rule = await this.ruleModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(userId),
      name: dto.name,
      trigger: dto.trigger,
      cronExpression: dto.cronExpression ?? null,
      platforms: dto.platforms,
      dailyTarget: dto.dailyTarget ?? 1,
      approvalMode: dto.approvalMode ?? "full-auto",
      isEnabled: true,
    });

    this.logger.log(
      `Automation rule created: ${rule._id.toString()} (${dto.trigger}) workspace=${workspaceId}`,
    );

    return this.mapRule(rule.toObject() as unknown as Record<string, unknown>);
  }

  async updateRule(
    workspaceId: string,
    ruleId: string,
    dto: UpdateAutomationRuleDto,
  ): Promise<AutomationRuleDto> {
    const rule = await this.ruleModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(ruleId),
          workspaceId: new Types.ObjectId(workspaceId),
        },
        { $set: dto },
        { new: true },
      )
      .lean()
      .exec();

    if (!rule) {
      throw new NotFoundException(`Automation rule ${ruleId} not found`);
    }

    return this.mapRule(rule);
  }

  async toggleRule(
    workspaceId: string,
    ruleId: string,
    isEnabled: boolean,
  ): Promise<AutomationRuleDto> {
    const rule = await this.ruleModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(ruleId),
          workspaceId: new Types.ObjectId(workspaceId),
        },
        { $set: { isEnabled } },
        { new: true },
      )
      .lean()
      .exec();

    if (!rule) {
      throw new NotFoundException(`Automation rule ${ruleId} not found`);
    }

    this.logger.log(
      `Rule ${ruleId} ${isEnabled ? "enabled" : "disabled"} workspace=${workspaceId}`,
    );

    return this.mapRule(rule);
  }

  async deleteRule(workspaceId: string, ruleId: string): Promise<void> {
    const result = await this.ruleModel
      .deleteOne({
        _id: new Types.ObjectId(ruleId),
        workspaceId: new Types.ObjectId(workspaceId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Automation rule ${ruleId} not found`);
    }
  }

  // ─── Manual Trigger ───────────────────────────────────────────────────────

  async triggerRuleNow(
    workspaceId: string,
    ruleId: string,
    triggeredBy: "manual" | "api" | "webhook" = "manual",
  ): Promise<AutomationRunDto> {
    const rule = await this.ruleModel
      .findOne({
        _id: new Types.ObjectId(ruleId),
        workspaceId: new Types.ObjectId(workspaceId),
      })
      .exec();

    if (!rule) {
      throw new NotFoundException(`Automation rule ${ruleId} not found`);
    }

    const run = await this.runModel.create({
      ruleId: rule._id,
      workspaceId: new Types.ObjectId(workspaceId),
      status: "queued",
      triggeredBy,
      startedAt: new Date(),
      stages: [
        { stage: "research", status: "pending" },
        { stage: "script", status: "pending" },
        { stage: "media", status: "pending" },
        { stage: "render", status: "pending" },
        { stage: "quality-check", status: "pending" },
        { stage: "publish", status: "pending" },
      ],
    });

    // Update lastRunAt on rule
    await this.ruleModel.updateOne(
      { _id: rule._id },
      { $set: { lastRunAt: new Date() } },
    );

    this.logger.log(
      `Automation run ${run._id.toString()} queued for rule=${ruleId} workspace=${workspaceId}`,
    );

    return this.mapRun(run.toObject() as unknown as Record<string, unknown>);
  }

  // ─── Webhook Trigger ─────────────────────────────────────────────────────

  async handleWebhookTrigger(
    ruleId: string,
    signature: string,
    rawBody: string,
  ): Promise<AutomationRunDto> {
    const secret = this.configService.get<string>("N8N_WEBHOOK_SECRET", "");

    if (secret) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    const rule = await this.ruleModel.findById(ruleId).exec();
    if (!rule) {
      throw new NotFoundException(`Automation rule ${ruleId} not found`);
    }

    return this.triggerRuleNow(rule.workspaceId.toString(), ruleId, "webhook");
  }

  // ─── Runs ─────────────────────────────────────────────────────────────────

  async listRuns(
    workspaceId: string,
    ruleId?: string,
    limit = 50,
  ): Promise<AutomationRunDto[]> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };
    if (ruleId) {
      filter.ruleId = new Types.ObjectId(ruleId);
    }

    const runs = await this.runModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return runs.map((r) => this.mapRun(r));
  }

  // ─── Status Summary ───────────────────────────────────────────────────────

  async getStatus(workspaceId: string): Promise<AutomationStatusDto> {
    const wid = new Types.ObjectId(workspaceId);

    const [totalRules, enabledRules, recentRuns] = await Promise.all([
      this.ruleModel.countDocuments({ workspaceId: wid }),
      this.ruleModel.countDocuments({ workspaceId: wid, isEnabled: true }),
      this.runModel
        .find({ workspaceId: wid })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
        .exec(),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRuns = recentRuns.filter(
      (r) => new Date(r.createdAt) >= todayStart,
    );

    const successfulRunsToday = todayRuns.filter(
      (r) => r.status === "completed",
    ).length;
    const failedRunsToday = todayRuns.filter(
      (r) => r.status === "failed",
    ).length;
    const queuedJobs = todayRuns.filter(
      (r) => r.status === "queued" || r.status === "running",
    ).length;
    const isRunning = queuedJobs > 0;

    const firstRun = recentRuns[0];
    const lastRunAt =
      firstRun !== undefined && firstRun !== null
        ? (firstRun.startedAt as Date | undefined)?.toISOString() ?? null
        : null;

    return {
      isRunning,
      totalRules,
      enabledRules,
      lastRunAt,
      successfulRunsToday,
      failedRunsToday,
      queuedJobs,
    };
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapRule(rule: Record<string, unknown>): AutomationRuleDto {
    return {
      id: (rule._id as Types.ObjectId).toString(),
      workspaceId: (rule.workspaceId as Types.ObjectId).toString(),
      name: rule.name as string,
      isEnabled: rule.isEnabled as boolean,
      trigger: rule.trigger as AutomationRuleDto["trigger"],
      cronExpression:
        (rule.cronExpression as string | null | undefined) ?? null,
      platforms: (rule.platforms as string[]) ?? [],
      dailyTarget: (rule.dailyTarget as number) ?? 1,
      approvalMode: rule.approvalMode as AutomationRuleDto["approvalMode"],
      lastRunAt:
        (rule.lastRunAt as Date | null)?.toISOString() ?? null,
      nextRunAt:
        (rule.nextRunAt as Date | null)?.toISOString() ?? null,
      createdBy: (rule.createdBy as Types.ObjectId).toString(),
      createdAt: (rule.createdAt as Date).toISOString(),
      updatedAt: (rule.updatedAt as Date).toISOString(),
    };
  }

  private mapRun(run: Record<string, unknown>): AutomationRunDto {
    const stages = ((run.stages as Record<string, unknown>[]) ?? []).map(
      (s) => ({
        stage: s.stage as AutomationRunDto["stages"][number]["stage"],
        status: s.status as AutomationRunDto["stages"][number]["status"],
        startedAt:
          (s.startedAt as Date | null)?.toISOString() ?? null,
        completedAt:
          (s.completedAt as Date | null)?.toISOString() ?? null,
        durationMs: (s.durationMs as number | null) ?? null,
        jobId: (s.jobId as string | null) ?? null,
        errorMessage: (s.errorMessage as string | null) ?? null,
      }),
    );

    return {
      id: (run._id as Types.ObjectId).toString(),
      ruleId: (run.ruleId as Types.ObjectId).toString(),
      workspaceId: (run.workspaceId as Types.ObjectId).toString(),
      contentId:
        (run.contentId as Types.ObjectId | null)?.toString() ?? null,
      status: run.status as AutomationRunDto["status"],
      triggeredBy: run.triggeredBy as AutomationRunDto["triggeredBy"],
      stages,
      startedAt: (run.startedAt as Date).toISOString(),
      completedAt:
        (run.completedAt as Date | null)?.toISOString() ?? null,
      durationMs: (run.durationMs as number | null) ?? null,
      errorMessage: (run.errorMessage as string | null) ?? null,
    };
  }
}
