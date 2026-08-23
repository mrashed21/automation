import { baseApi } from "@/lib/api-client";
import { setUser, setCurrentWorkspace, logout } from "@/store/slices/auth-slice";
import { setWorkspaces } from "@/store/slices/workspace-slice";
import type { AuthResponseDto, UserDto, WorkspaceDto } from "@repo/types";
import type { LoginInput, RegisterInput } from "@repo/validation";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponseDto, RegisterInput>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          dispatch(setCurrentWorkspace(data.activeWorkspace));
          dispatch(setWorkspaces(data.workspaces));
        } catch {
          // handled by error state
        }
      },
    }),

    login: builder.mutation<AuthResponseDto, LoginInput>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          dispatch(setCurrentWorkspace(data.activeWorkspace));
          dispatch(setWorkspaces(data.workspaces));
        } catch {
          // handled by error state
        }
      },
    }),

    logout: builder.mutation<{ success: true }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch {
          dispatch(logout());
        }
      },
    }),

    getMe: builder.query<
      { user: UserDto; workspaces: WorkspaceDto[]; activeWorkspace: WorkspaceDto },
      void
    >({
      query: () => "/auth/me",
      providesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          dispatch(setCurrentWorkspace(data.activeWorkspace));
          dispatch(setWorkspaces(data.workspaces));
        } catch {
          dispatch(setUser(null));
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;
