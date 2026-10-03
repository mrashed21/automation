import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { Model } from "mongoose";
import { Types } from "mongoose";
import type { WorkspaceMemberDocument } from "../../database/schemas/workspace-member.schema";
import { WorkspaceGuard } from "./workspace.guard";

describe("WorkspaceGuard", () => {
  let guard: WorkspaceGuard;

  const mockWorkspaceMemberModel = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    guard = new WorkspaceGuard(
      mockWorkspaceMemberModel as unknown as Model<WorkspaceMemberDocument>,
    );
  });

  it("should allow request if no workspace context is specified", async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { userId: new Types.ObjectId().toString() },
          headers: {},
          query: {},
          params: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it("should throw ForbiddenException if user is not a member of the requested workspace", async () => {
    const validWsId = new Types.ObjectId().toString();
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { userId: new Types.ObjectId().toString() },
          headers: { "x-workspace-id": validWsId },
          query: {},
          params: {},
        }),
      }),
    } as unknown as ExecutionContext;

    mockWorkspaceMemberModel.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it("should throw NotFoundException if workspace ID is malformed", async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { userId: new Types.ObjectId().toString() },
          headers: { "x-workspace-id": "invalid-id" },
          query: {},
          params: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
  });
});
