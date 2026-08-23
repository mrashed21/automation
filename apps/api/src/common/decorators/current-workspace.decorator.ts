import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { ActiveWorkspaceContext } from "@repo/types";

export const CurrentWorkspace = createParamDecorator(
  (data: keyof ActiveWorkspaceContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const workspace = request.workspace as ActiveWorkspaceContext;

    return data ? workspace?.[data] : workspace;
  },
);
