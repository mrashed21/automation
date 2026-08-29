"use client";

import * as React from "react";
import { FileText, Send, BarChart3 } from "lucide-react";

import { MetricCard } from "@/features/dashboard/components/metric-card";

/**
 * Stats summary row for the dashboard home page.
 *
 * Displays three top-level metrics:
 * - Pipeline status overview (content in progress)
 * - Scheduled content count
 * - Published content count
 *
 * NOTE: Data is placeholder for Phase 02. Real RTK Query content endpoints
 * are wired in Phase 03 when the content module is implemented.
 */
export function StatsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        id="metric-pipeline-status"
        label="In Pipeline"
        value="—"
        description="Content items currently being processed"
        icon={FileText}
        trend={{ direction: "neutral", label: "Connect content API in Phase 03" }}
      />
      <MetricCard
        id="metric-scheduled-count"
        label="Scheduled"
        value="—"
        description="Upcoming publications across platforms"
        icon={Send}
        trend={{ direction: "neutral", label: "Connect scheduling API in Phase 08" }}
      />
      <MetricCard
        id="metric-published-count"
        label="Published"
        value="—"
        description="Total published content items"
        icon={BarChart3}
        trend={{ direction: "neutral", label: "Connect analytics API in Phase 11" }}
      />
    </div>
  );
}
