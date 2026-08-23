// Common shared types used across the platform

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

/** Standard API success response wrapper */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Cursor-based pagination for large datasets */
export interface CursorPaginatedResponse<T> {
  data: T[];
  cursor: {
    nextCursor: Nullable<string>;
    hasMore: boolean;
  };
}

/** Job state for BullMQ jobs */
export type JobState =
  "queued" | "processing" | "completed" | "failed" | "retrying" | "cancelled" | "dead-letter";

/** Audit action types for the audit log */
export type AuditAction =
  | "login"
  | "logout"
  | "account-connected"
  | "account-disconnected"
  | "automation-enabled"
  | "automation-disabled"
  | "content-published"
  | "content-deleted"
  | "settings-changed"
  | "role-changed";
