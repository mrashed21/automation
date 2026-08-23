import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { UserDto, WorkspaceDto } from "@repo/types";

interface AuthState {
  user: UserDto | null;
  currentWorkspace: WorkspaceDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  currentWorkspace: null,
  isAuthenticated: false,
  isLoading: true, // true on startup while checking session
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserDto | null>) {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
      state.isLoading = false;
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
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { setUser, setCurrentWorkspace, setAuthLoading, logout } = authSlice.actions;
