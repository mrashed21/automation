"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";

import { store } from "@/store/store";

/**
 * Client-side providers wrapping the entire application.
 * Per plan.md section 7: providers.tsx in the app root.
 *
 * Contains:
 * - Redux store provider
 * - Toast notifications (Sonner)
 * Phase 1 will add: AuthProvider for session initialization
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="bottom-right" richColors closeButton duration={4000} />
    </Provider>
  );
}
