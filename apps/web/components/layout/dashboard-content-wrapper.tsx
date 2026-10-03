"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

/**
 * Client-side wrapper that reads the sidebarCollapsed state from Redux
 * and applies the matching CSS class to the main content area.
 *
 * This must be a separate client component because the parent layout.tsx
 * is a server component and cannot call useAppSelector directly.
 */
export function DashboardContentWrapper({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <div className={cn("sidebar-content-area", collapsed && "collapsed")}>
      {children}
    </div>
  );
}
