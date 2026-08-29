import { baseApi } from "@/lib/api-client";
import type {
  ResearchDto,
  ResearchFactDto,
} from "@repo/types";
import type {
  GenerateResearchInput,
  VerifyFactInput,
} from "@repo/validation";

export const researchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getResearchByContentId: builder.query<ResearchDto, string>({
      query: (contentId) => `/content/${contentId}/research`,
      providesTags: (_result, _error, id) => [{ type: "Research", id }],
    }),

    generateResearch: builder.mutation<
      ResearchDto,
      { contentId: string; input?: GenerateResearchInput }
    >({
      query: ({ contentId, input }) => ({
        url: `/content/${contentId}/research`,
        method: "POST",
        body: input,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Research", id: contentId },
        { type: "Content", id: contentId },
        { type: "Content", id: "LIST" },
      ],
    }),

    updateFactStatus: builder.mutation<
      ResearchFactDto,
      { contentId: string; factId: string; input: VerifyFactInput }
    >({
      query: ({ contentId, factId, input }) => ({
        url: `/content/${contentId}/research/facts/${factId}`,
        method: "PATCH",
        body: input,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Research", id: contentId },
      ],
    }),

    verifyAllFacts: builder.mutation<ResearchDto, string>({
      query: (contentId) => ({
        url: `/content/${contentId}/research/verify`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, contentId) => [
        { type: "Research", id: contentId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetResearchByContentIdQuery,
  useGenerateResearchMutation,
  useUpdateFactStatusMutation,
  useVerifyAllFactsMutation,
} = researchApi;
