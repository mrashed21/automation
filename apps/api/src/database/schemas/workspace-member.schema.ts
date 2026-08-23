import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";
import type { HydratedDocument } from "mongoose";
import type { WorkspaceMemberRole } from "@repo/types";

export type WorkspaceMemberDocument = HydratedDocument<WorkspaceMember>;

@Schema({
  collection: "workspace-members",
  timestamps: true,
})
export class WorkspaceMember {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true, index: true })
  userId!: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ["owner", "admin", "editor", "viewer"],
    default: "editor",
    required: true,
  })
  role!: WorkspaceMemberRole;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkspaceMemberSchema = SchemaFactory.createForClass(WorkspaceMember);

// Compound unique index ensuring a user has at most one membership record per workspace
WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
