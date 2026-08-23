import type { UserDto, WorkspaceDto } from "./workspace.types";

/** Token response returned upon login/registration/refresh */
export interface AuthResponseDto {
  user: UserDto;
  activeWorkspace: WorkspaceDto;
  workspaces: WorkspaceDto[];
  accessToken: string;
  expiresIn: number;
}

/** Decoded JWT payload */
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

/** Request context containing authenticated user */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
}

/** Request context containing active workspace membership */
export interface ActiveWorkspaceContext {
  workspaceId: string;
  role: string;
}
