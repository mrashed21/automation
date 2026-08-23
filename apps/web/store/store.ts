import { configureStore } from "@reduxjs/toolkit";

import { authSlice } from "@/store/slices/auth-slice";
import { workspaceSlice } from "@/store/slices/workspace-slice";
import { uiSlice } from "@/store/slices/ui-slice";
import { baseApi } from "@/lib/api-client";

/**
 * Redux store configuration per plan.md section 13.
 *
 * Redux slices: auth · workspace · ui · preferences
 * RTK Query baseApi with all feature endpoints injected.
 *
 * Only client/application state lives in Redux slices.
 * Server state is managed by RTK Query cache.
 */
export const store = configureStore({
  reducer: {
    // Application state slices
    auth: authSlice.reducer,
    workspace: workspaceSlice.reducer,
    ui: uiSlice.reducer,

    // RTK Query API reducers (server state cache)
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
