import { baseApi } from "@/lib/api-client";
import type {
  SocialAccountDto,
  PublicationRecordDto,
} from "@repo/types";
import type {
  ConnectSocialAccountInput,
  CreatePublicationInput,
} from "@repo/validation";

export const publishingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConnectedAccounts: builder.query<SocialAccountDto[], void>({
      query: () => "/social/accounts",
      providesTags: ["SocialAccount"],
    }),

    connectSocialAccount: builder.mutation<SocialAccountDto, ConnectSocialAccountInput>({
      query: (data) => ({
        url: "/social/accounts/connect",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SocialAccount"],
    }),

    disconnectSocialAccount: builder.mutation<{ success: boolean }, string>({
      query: (accountId) => ({
        url: `/social/accounts/${accountId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SocialAccount"],
    }),

    getContentPublications: builder.query<PublicationRecordDto[], string>({
      query: (contentId) => `/content/${contentId}/publications`,
      providesTags: (_result, _error, contentId) => [
        { type: "Content", id: contentId },
        { type: "Publication", id: contentId },
      ],
    }),

    publishNow: builder.mutation<
      PublicationRecordDto,
      { contentId: string; data: CreatePublicationInput }
    >({
      query: ({ contentId, data }) => ({
        url: `/content/${contentId}/publish`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Content", id: contentId },
        { type: "Publication", id: contentId },
      ],
    }),

    schedulePublication: builder.mutation<
      PublicationRecordDto,
      { contentId: string; data: CreatePublicationInput }
    >({
      query: ({ contentId, data }) => ({
        url: `/content/${contentId}/schedule`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { contentId }) => [
        { type: "Content", id: contentId },
        { type: "Publication", id: contentId },
      ],
    }),
  }),
});

export const {
  useGetConnectedAccountsQuery,
  useConnectSocialAccountMutation,
  useDisconnectSocialAccountMutation,
  useGetContentPublicationsQuery,
  usePublishNowMutation,
  useSchedulePublicationMutation,
} = publishingApi;
