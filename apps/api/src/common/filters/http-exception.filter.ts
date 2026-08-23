import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

import type { ApiErrorResponse } from "@repo/types";

/**
 * Global HTTP exception filter.
 * Normalizes all errors to the standard API error response shape defined in plan.md section 61.
 * Never exposes stack traces in production.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env["NODE_ENV"] === "production";

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected error occurred.";

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
        errorCode = this.statusToErrorCode(statusCode);
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const exceptionObj = exceptionResponse as Record<string, unknown>;
        message = (exceptionObj["message"] as string) ?? message;
        errorCode = (exceptionObj["error"] as string) ?? this.statusToErrorCode(statusCode);
      }
    } else if (exception instanceof Error) {
      // Log unexpected errors
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        isProduction ? undefined : exception.stack,
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: errorCode.toUpperCase().replace(/\s+/g, "_"),
        message,
      },
    };

    response.status(statusCode).json(errorResponse);
  }

  private statusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "UNPROCESSABLE_ENTITY",
      429: "TOO_MANY_REQUESTS",
      500: "INTERNAL_SERVER_ERROR",
    };
    return map[status] ?? "INTERNAL_SERVER_ERROR";
  }
}
