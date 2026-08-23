import { baseApi } from "@/lib/api-client";
import { setWorkspaces } from "@/store/slices/workspace-slice";
import type { WorkspaceDto, WorkspaceMemberDto } from "@repo/types";
import type {
  CreateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateWorkspaceInput,
} from "@repo/validation";

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<WorkspaceDto[], void>({
      query: () => "/workspaces",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Workspace" as const, id })),
              { type: "Workspace", id: "LIST" },
            ]
          : [{ type: "Workspace", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setWorkspaces(data));
        } catch {
          // ignore
        }
      },
    }),

    getWorkspaceById: builder.query<WorkspaceDto, string>({
      query: (id) => `/workspaces/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Workspace", id }],
    }),

    createWorkspace: builder.mutation<WorkspaceDto, CreateWorkspaceInput>({
      query: (body) => ({
        url: "/workspaces",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Workspace", id: "LIST" }],
    }),

    updateWorkspace: builder.mutation<WorkspaceDto, { id: string } & UpdateWorkspaceInput>({
      query: ({ id, ...body }) => ({
        url: `/workspaces/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Workspace", id },
        { type: "Workspace", id: "LIST" },
      ],
    }),

    getWorkspaceMembers: builder.query<WorkspaceMemberDto[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/members`,
      providesTags: (_result, _error, workspaceId) => [
        { type: "Workspace", id: `MEMBERS-${workspaceId}` },
      ],
    }),

    inviteMember: builder.mutation<
      { success: true },
      { workspaceId: string } & InviteMemberInput
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: `MEMBERS-${workspaceId}` },
      ],
    }),

    updateMemberRole: builder.mutation<
      { success: true },
      { workspaceId: string; userId: string } & UpdateMemberRoleInput
    >({
      query: ({ workspaceId, userId, ...body }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: `MEMBERS-${workspaceId}` },
      ],
    }),

    removeMember: builder.mutation<void, { workspaceId: string; userId: string }>({
      query: ({ workspaceId, userId }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: `MEMBERS-${workspaceId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceByIdQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = workspaceApi;
