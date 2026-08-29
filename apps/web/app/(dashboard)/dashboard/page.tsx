import * as React from "react";
import type { Metadata } from "next";

import { StatsRow } from "@/features/dashboard/components/stats-row";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "AI Content Platform — overview of your content pipeline.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Overview of your content pipeline, scheduled publications, and performance.
        </p>
      </div>

      {/* Metric cards */}
      <StatsRow />

      {/* Placeholder for future activity feed / quick actions */}
      <div className="rounded-xl border border-[var(--border)] border-dashed bg-[var(--muted)]/30 p-8 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Content activity feed and quick actions will appear here in Phase 03.
        </p>
      </div>
    </div>
  );
}
