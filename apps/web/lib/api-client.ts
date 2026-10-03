import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { logout, setToken } from "@/store/slices/auth-slice";
import { API_BASE_PATH } from "@repo/config";

const rawApiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3010";
const apiUrl = rawApiUrl.replace(/\/+$/, "");
const basePath = API_BASE_PATH.replace(/^\/+/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${apiUrl}/${basePath}`,
  credentials: "include", // Send HttpOnly refresh cookies
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as {
      auth?: {
        accessToken?: string | null;
        currentWorkspace?: { id?: string } | null;
      };
    };

    let token = state?.auth?.accessToken;
    if (!token && typeof window !== "undefined") {
      try {
        token = localStorage.getItem("acp_access_token");
      } catch {
        // ignore
      }
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const workspaceId = state?.auth?.currentWorkspace?.id;
    if (workspaceId) {
      headers.set("x-workspace-id", workspaceId);
    }

    return headers;
  },
});

/**
 * Custom base query that intercepts 401s and attempts silent token refresh
 * using the HttpOnly refresh token cookie before rejecting.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;
  const isAuthEndpoint =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh");

  if (result.error && result.error.status === 401 && !isAuthEndpoint) {
    // Try to get a new access token via HttpOnly cookie
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { accessToken: string };
      api.dispatch(setToken(data.accessToken));
      // Retry original request with the new access token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Content",
    "Research",
    "Script",
    "MediaAsset",
    "Publishing",
    "SocialAccount",
    "Publication",
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
