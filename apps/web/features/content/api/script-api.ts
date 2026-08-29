import { baseApi } from "@/lib/api-client";
import type {
  ScriptDto,
  ScriptVersionDto,
} from "@repo/types";
import type {
  GenerateScriptInput,
  UpdateScriptInput,
} from "@repo/validation";

export const scriptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScriptByContentId: builder.query<ScriptDto, string>({
      query: (contentId) => `/content/${contentId}/script`,
      providesTags: (_result, _error, id) => [{ type: "Script", id }],
    }),

    getScriptVersions: builder.query<ScriptVersionDto[], string>({
      query: (contentId) => `/content/${contentId}/script/versions`,
      providesTags: (_result, _error, id) => [{ type: "Script", id: `VERSIONS_${id}` }],
    }),

    generateScript: builder.mutation<
      ScriptDto,
      { contentId: string; input?: GenerateScriptInput }
    >({
      query: ({ contentId, input }) => ({
        url: `/content/${contentId}/script`,
        method: "POST",
        body: input,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Script", id: contentId },
        { type: "Script", id: `VERSIONS_${contentId}` },
        { type: "Content", id: contentId },
        { type: "Content", id: "LIST" },
      ],
    }),

    updateScript: builder.mutation<
      ScriptDto,
      { contentId: string; input: UpdateScriptInput }
    >({
      query: ({ contentId, input }) => ({
        url: `/content/${contentId}/script`,
        method: "PATCH",
        body: input,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Script", id: contentId },
        { type: "Script", id: `VERSIONS_${contentId}` },
        { type: "Content", id: contentId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScriptByContentIdQuery,
  useGetScriptVersionsQuery,
  useGenerateScriptMutation,
  useUpdateScriptMutation,
} = scriptApi;
