"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "../api/auth-api";
import { useAppSelector } from "@/store/hooks";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAppSelector(
    (state) => state.auth,
  );

  const {
    isLoading: meLoading,
    isError,
    isFetching,
  } = useGetMeQuery(undefined, {
    skip: !accessToken && !isAuthenticated,
  });

  const isCheckingSession = authLoading || (isFetching && !user) || (meLoading && !user);

  React.useEffect(() => {
    if (!isCheckingSession) {
      if (!isAuthenticated && !user && !accessToken) {
        router.push("/login");
      } else if (isError && !user) {
        router.push("/login");
      }
    }
  }, [isCheckingSession, isAuthenticated, user, accessToken, isError, router]);

  if (isCheckingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent dark:border-zinc-50" />
          <p className="text-sm text-zinc-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return null;
  }

  return <>{children}</>;
}
