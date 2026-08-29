import { baseApi } from "@/lib/api-client";
import type {
  ContentOpportunityDto,
  StrategyInsightDto,
  TopicDiversityResultDto,
  AutoDiscoverTopicsInputDto,
} from "@repo/types";

export const strategyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOpportunities: builder.query<ContentOpportunityDto[], { status?: string } | void>({
      query: (params) => {
        const qs = params && params.status ? `?status=${params.status}` : "";
        return `/strategy/opportunities${qs}`;
      },
      providesTags: [{ type: "Platform", id: "opportunities" }],
    }),

    discoverOpportunities: builder.mutation<ContentOpportunityDto[], AutoDiscoverTopicsInputDto>({
      query: (data) => ({
        url: "/strategy/discover",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Platform", id: "opportunities" }],
    }),

    produceFromOpportunity: builder.mutation<
      { opportunity: ContentOpportunityDto; contentId: string },
      string
    >({
      query: (id) => ({
        url: `/strategy/opportunities/${id}/produce`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Platform", id: "opportunities" },
        "Content",
      ],
    }),

    dismissOpportunity: builder.mutation<ContentOpportunityDto, string>({
      query: (id) => ({
        url: `/strategy/opportunities/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Platform", id: "opportunities" }],
    }),

    checkTopicDiversity: builder.mutation<
      TopicDiversityResultDto,
      { topic: string; threshold?: number }
    >({
      query: (data) => ({
        url: "/strategy/diversity-check",
        method: "POST",
        body: data,
      }),
    }),

    getStrategyInsights: builder.query<StrategyInsightDto, void>({
      query: () => "/strategy/insights",
      providesTags: [{ type: "Platform", id: "insights" }],
    }),
  }),
});

export const {
  useListOpportunitiesQuery,
  useDiscoverOpportunitiesMutation,
  useProduceFromOpportunityMutation,
  useDismissOpportunityMutation,
  useCheckTopicDiversityMutation,
  useGetStrategyInsightsQuery,
} = strategyApi;
