import { baseApi } from "@/lib/api-client";
import type {
  ContentMediaPackageDto,
  MediaAssetDto,
  ThumbnailAssetDto,
  VoiceAssetDto,
  MediaType,
  RenderStatusDto,
} from "@repo/types";
import type {
  GenerateVoiceNarrationInput,
  GenerateThumbnailVariantsInput,
  StartRenderJobInput,
} from "@repo/validation";

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentMedia: builder.query<ContentMediaPackageDto, string>({
      query: (contentId: string) => `/content/${contentId}/media`,
      providesTags: (_result, _error, contentId) => [
        { type: "Content", id: contentId },
        { type: "Content", id: `MEDIA_${contentId}` },
      ],
    }),

    getMediaAssets: builder.query<
      { data: MediaAssetDto[]; total: number; page: number; limit: number },
      { type?: MediaType; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append("type", params.type);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        const qs = queryParams.toString();
        return `/media-assets${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Content"],
    }),

    generateVoiceNarration: builder.mutation<
      VoiceAssetDto,
      { contentId: string; data: GenerateVoiceNarrationInput }
    >({
      query: ({ contentId, data }) => ({
        url: `/content/${contentId}/media/voice`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Content", id: contentId },
        { type: "Content", id: `MEDIA_${contentId}` },
      ],
    }),

    generateThumbnailVariants: builder.mutation<
      ThumbnailAssetDto[],
      { contentId: string; data: GenerateThumbnailVariantsInput }
    >({
      query: ({ contentId, data }) => ({
        url: `/content/${contentId}/media/thumbnails`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Content", id: contentId },
        { type: "Content", id: `MEDIA_${contentId}` },
      ],
    }),

    selectPrimaryThumbnail: builder.mutation<
      ThumbnailAssetDto,
      { contentId: string; thumbId: string }
    >({
      query: ({ contentId, thumbId }) => ({
        url: `/content/${contentId}/media/thumbnails/${thumbId}/select`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Content", id: contentId },
        { type: "Content", id: `MEDIA_${contentId}` },
      ],
    }),

    deleteMediaAsset: builder.mutation<{ success: boolean }, string>({
      query: (assetId: string) => ({
        url: `/media-assets/${assetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Content"],
    }),

    startContentRender: builder.mutation<
      RenderStatusDto,
      { contentId: string; data: StartRenderJobInput }
    >({
      query: ({ contentId, data }) => ({
        url: `/content/${contentId}/render`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Content", id: contentId },
        { type: "Content", id: `MEDIA_${contentId}` },
      ],
    }),

    getRenderStatus: builder.query<RenderStatusDto, string>({
      query: (contentId: string) => `/content/${contentId}/render/status`,
      providesTags: (_result, _error, contentId) => [
        { type: "Content", id: `RENDER_${contentId}` },
      ],
    }),
  }),
});

export const {
  useGetContentMediaQuery,
  useGetMediaAssetsQuery,
  useGenerateVoiceNarrationMutation,
  useGenerateThumbnailVariantsMutation,
  useSelectPrimaryThumbnailMutation,
  useDeleteMediaAssetMutation,
  useStartContentRenderMutation,
  useGetRenderStatusQuery,
} = mediaApi;
