import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_BASE_PATH } from "@repo/config";

/**
 * RTK Query base API configuration.
 * All feature API slices extend this base query via `injectEndpoints`.
 *
 * Per plan.md section 14: centralizes base URL, authentication, refresh handling,
 * error normalization, and request headers.
 */
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001"}/${API_BASE_PATH}`,
    credentials: "include", // Send cookies for session-based auth
    prepareHeaders: (headers) => {
      // Auth token injection happens here in Phase 1 after JWT is implemented
      return headers;
    },
  }),
  tagTypes: [
    "Content",
    "Research",
    "Script",
    "MediaAsset",
    "Publishing",
    "Analytics",
    "Platform",
    "Workspace",
    "User",
    "AiJob",
    "Activity",
    "Automation",
  ],
  endpoints: () => ({}),
});
