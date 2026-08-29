import { baseApi } from "@/lib/api-client";
import type { AnalyticsSnapshotDto } from "@repo/types";

interface WorkspaceSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalWatchTimeHours: number;
  publishedContentCount: number;
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsSnapshots: builder.query<AnalyticsSnapshotDto[], string>({
      query: (contentId) => `/content/${contentId}/analytics/snapshots`,
      providesTags: (_result, _error, contentId) => [
        { type: "Analytics", id: contentId },
      ],
    }),

    getLatestAnalytics: builder.query<AnalyticsSnapshotDto[], string>({
      query: (contentId) => `/content/${contentId}/analytics/latest`,
      providesTags: (_result, _error, contentId) => [
        { type: "Analytics", id: `latest-${contentId}` },
      ],
    }),

    syncAnalytics: builder.mutation<AnalyticsSnapshotDto[], string>({
      query: (contentId) => ({
        url: `/content/${contentId}/analytics/sync`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, contentId) => [
        { type: "Analytics", id: contentId },
        { type: "Analytics", id: `latest-${contentId}` },
      ],
    }),

    getAnalyticsSummary: builder.query<WorkspaceSummary, void>({
      query: () => "/analytics/summary",
      providesTags: [{ type: "Analytics", id: "summary" }],
    }),
  }),
});

export const {
  useGetAnalyticsSnapshotsQuery,
  useGetLatestAnalyticsQuery,
  useSyncAnalyticsMutation,
  useGetAnalyticsSummaryQuery,
} = analyticsApi;
