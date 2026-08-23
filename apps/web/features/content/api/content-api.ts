import { baseApi } from "@/lib/api-client";

import type { ContentDto, PaginatedResponse } from "@repo/types";
import type { CreateContentInput, UpdateContentInput } from "@repo/validation";

/**
 * RTK Query API slice for content feature.
 * Per plan.md section 14: feature-specific APIs extend the base client.
 */
export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContents: builder.query<
      PaginatedResponse<ContentDto>,
      { workspaceId: string; page?: number; limit?: number; status?: string }
    >({
      query: ({ workspaceId, page = 1, limit = 20, status }) => ({
        url: "/content",
        params: { workspaceId, page, limit, ...(status && { status }) },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Content" as const, id })),
              { type: "Content", id: "LIST" },
            ]
          : [{ type: "Content", id: "LIST" }],
    }),

    getContentById: builder.query<ContentDto, string>({
      query: (id) => `/content/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Content", id }],
    }),

    createContent: builder.mutation<ContentDto, CreateContentInput>({
      query: (body) => ({
        url: "/content",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Content", id: "LIST" }],
    }),

    updateContent: builder.mutation<ContentDto, { id: string } & UpdateContentInput>({
      query: ({ id, ...body }) => ({
        url: `/content/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Content", id },
        { type: "Content", id: "LIST" },
      ],
    }),

    deleteContent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/content/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Content", id },
        { type: "Content", id: "LIST" },
      ],
    }),

    triggerContentGeneration: builder.mutation<{ jobId: string }, string>({
      query: (id) => ({
        url: `/content/${id}/generate`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Content", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContentsQuery,
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useTriggerContentGenerationMutation,
} = contentApi;
