import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { UserDto, WorkspaceDto } from "@repo/types";

interface AuthState {
  user: UserDto | null;
  currentWorkspace: WorkspaceDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getStoredToken = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("acp_access_token");
    } catch {
      return null;
    }
  }
  return null;
};

const initialToken = getStoredToken();

const initialState: AuthState = {
  user: null,
  currentWorkspace: null,
  accessToken: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: true, // true on startup while checking session
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: UserDto;
        activeWorkspace: WorkspaceDto | null;
        accessToken?: string;
      }>,
    ) {
      state.user = action.payload.user;
      state.currentWorkspace = action.payload.activeWorkspace;
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("acp_access_token", action.payload.accessToken);
          } catch {
            // ignore localStorage quota errors
          }
        }
      }
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUser(state, action: PayloadAction<UserDto | null>) {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
      state.isLoading = false;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      if (typeof window !== "undefined") {
        try {
          if (action.payload) {
            localStorage.setItem("acp_access_token", action.payload);
          } else {
            localStorage.removeItem("acp_access_token");
          }
        } catch {
          // ignore
        }
      }
    },
    setCurrentWorkspace(state, action: PayloadAction<WorkspaceDto | null>) {
      state.currentWorkspace = action.payload;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    logout(state) {
      state.user = null;
      state.currentWorkspace = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("acp_access_token");
        } catch {
          // ignore
        }
      }
    },
  },
});

export const {
  setCredentials,
  setUser,
  setToken,
  setCurrentWorkspace,
  setAuthLoading,
  logout,
} = authSlice.actions;
