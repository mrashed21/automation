import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { WorkspaceDto } from "@repo/types";

interface WorkspaceState {
  workspaces: WorkspaceDto[];
  selectedWorkspaceId: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  selectedWorkspaceId: null,
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces(state, action: PayloadAction<WorkspaceDto[]>) {
      state.workspaces = action.payload;
    },
    selectWorkspace(state, action: PayloadAction<string>) {
      state.selectedWorkspaceId = action.payload;
    },
  },
});

export const { setWorkspaces, selectWorkspace } = workspaceSlice.actions;
