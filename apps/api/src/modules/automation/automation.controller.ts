import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentWorkspace } from "../../common/decorators/current-workspace.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AutomationService } from "./automation.service";
import {
  createAutomationRuleSchema,
  updateAutomationRuleSchema,
  toggleAutomationRuleSchema,
} from "@repo/validation";

@ApiTags("Automation")
@Controller()
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  // ─── Rules (JWT protected) ────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Get("api/v1/automation/rules")
  @ApiOperation({ summary: "List automation rules for current workspace" })
  async listRules(@CurrentWorkspace() workspaceId: string) {
    return this.automationService.findAllRules(workspaceId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Post("api/v1/automation/rules")
  @ApiOperation({ summary: "Create a new automation rule" })
  async createRule(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: { id: string },
    @Body() body: unknown,
  ) {
    const dto = createAutomationRuleSchema.parse(body);
    return this.automationService.createRule(workspaceId, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Patch("api/v1/automation/rules/:id")
  @ApiOperation({ summary: "Update an automation rule" })
  async updateRule(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") ruleId: string,
    @Body() body: unknown,
  ) {
    const dto = updateAutomationRuleSchema.parse(body);
    return this.automationService.updateRule(workspaceId, ruleId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Post("api/v1/automation/rules/:id/toggle")
  @ApiOperation({ summary: "Toggle automation rule enabled/disabled" })
  async toggleRule(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") ruleId: string,
    @Body() body: unknown,
  ) {
    const { isEnabled } = toggleAutomationRuleSchema.parse(body);
    return this.automationService.toggleRule(workspaceId, ruleId, isEnabled);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Delete("api/v1/automation/rules/:id")
  @ApiOperation({ summary: "Delete an automation rule" })
  async deleteRule(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") ruleId: string,
  ) {
    await this.automationService.deleteRule(workspaceId, ruleId);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Post("api/v1/automation/rules/:id/trigger")
  @ApiOperation({ summary: "Manually trigger an automation rule run" })
  async triggerRule(
    @CurrentWorkspace() workspaceId: string,
    @Param("id") ruleId: string,
  ) {
    return this.automationService.triggerRuleNow(workspaceId, ruleId, "manual");
  }

  // ─── Runs ─────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Get("api/v1/automation/runs")
  @ApiOperation({ summary: "List automation run history for workspace" })
  async listRuns(
    @CurrentWorkspace() workspaceId: string,
    @Query("ruleId") ruleId?: string,
    @Query("limit") limit?: string,
  ) {
    return this.automationService.listRuns(
      workspaceId,
      ruleId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Get("api/v1/automation/status")
  @ApiOperation({ summary: "Get automation engine status summary" })
  async getStatus(@CurrentWorkspace() workspaceId: string) {
    return this.automationService.getStatus(workspaceId);
  }

  // ─── Webhook (Public — HMAC verified internally) ──────────────────────────

  @Public()
  @Post("api/v1/automation/webhook/:ruleId")
  @ApiOperation({ summary: "n8n webhook trigger for automation rule (HMAC verified)" })
  async webhookTrigger(
    @Param("ruleId") ruleId: string,
    @Headers("x-webhook-signature") signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    const rawBody =
      req.rawBody instanceof Buffer
        ? req.rawBody.toString("utf8")
        : JSON.stringify(req.body ?? {});
    return this.automationService.handleWebhookTrigger(
      ruleId,
      signature ?? "",
      rawBody,
    );
  }
}
