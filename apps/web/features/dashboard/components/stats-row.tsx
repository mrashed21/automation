"use client";

import { useGetAnalyticsSummaryQuery } from "@/features/content/api/analyticsApi";
import { useGetContentsQuery } from "@/features/content/api/content-api";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { useListOpportunitiesQuery } from "@/features/strategy/api/strategyApi";
import { BarChart3, FileText, Send, Sparkles } from "lucide-react";

export function StatsRow() {
  const { data: contentsData, isLoading: isLoadingContents } = useGetContentsQuery({ limit: 100 });
  const { data: analyticsSummary, isLoading: isLoadingAnalytics } = useGetAnalyticsSummaryQuery();
  const { data: opportunities = [] } = useListOpportunitiesQuery();

  const allItems = contentsData?.data || [];
  const inPipelineCount = allItems.filter(
    (c) => c.status !== "published" && c.status !== "failed" && c.status !== "archived",
  ).length;
  const scheduledCount = allItems.filter((c) => c.status === "scheduled").length;
  const publishedCount = analyticsSummary?.publishedContentCount ?? allItems.filter((c) => c.status === "published").length;
  const viralOppCount = opportunities.filter((o) => o.status === "suggested").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        id="metric-pipeline-status"
        label="In Pipeline"
        value={isLoadingContents ? "..." : inPipelineCount.toString()}
        description="Active production lifecycle items"
        icon={FileText}
        color="#6366f1"
        trend={{ direction: "up", label: "Active" }}
      />
      <MetricCard
        id="metric-viral-opportunities"
        label="AI Opportunities"
        value={viralOppCount.toString()}
        description="High-yield viral topic candidates"
        icon={Sparkles}
        color="#a855f7"
        trend={{ direction: "up", label: "AI Discovered" }}
      />
      <MetricCard
        id="metric-scheduled-count"
        label="Scheduled"
        value={isLoadingContents ? "..." : scheduledCount.toString()}
        description="Queued multi-platform uploads"
        icon={Send}
        color="#f59e0b"
        trend={{ direction: "neutral", label: "Automated" }}
      />
      <MetricCard
        id="metric-published-count"
        label="Published & Live"
        value={isLoadingAnalytics ? "..." : publishedCount.toString()}
        description="Distributed across YouTube & Meta"
        icon={BarChart3}
        color="#10b981"
        trend={{ direction: "up", label: "Telemetry Ready" }}
      />
    </div>
  );
}
