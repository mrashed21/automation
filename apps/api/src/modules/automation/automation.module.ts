import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  AutomationRule,
  AutomationRuleSchema,
} from "../../database/schemas/automation-rule.schema";
import {
  AutomationRun,
  AutomationRunSchema,
} from "../../database/schemas/automation-run.schema";
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from "../../database/schemas/workspace-member.schema";
import { AutomationService } from "./automation.service";
import { AutomationController } from "./automation.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AutomationRule.name, schema: AutomationRuleSchema },
      { name: AutomationRun.name, schema: AutomationRunSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
  ],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
