import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from "../../database/schemas/workspace-member.schema";
import { Workspace, WorkspaceSchema } from "../../database/schemas/workspace.schema";
import { UsersModule } from "../users/users.module";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
    UsersModule,
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService, MongooseModule],
})
export class WorkspacesModule {}
