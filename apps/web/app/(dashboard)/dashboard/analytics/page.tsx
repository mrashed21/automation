"use client";

import { useGetAnalyticsSummaryQuery } from "@/features/content/api/analyticsApi";
import { useGetContentsQuery } from "@/features/content/api/content-api";
import type { ContentDto } from "@repo/types";
import Link from "next/link";

export default function AnalyticsPage() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummaryQuery();
  const { data: contentsData, isLoading: isLoadingContents } = useGetContentsQuery({ limit: 20 });

  const publishedVideos: ContentDto[] = (contentsData?.data || []).filter(
    (c: ContentDto) => c.status === "published",
  );

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            📊
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Workspace Analytics Studio
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Aggregated multi-platform growth curves, viewer engagement, and reach metrics
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          { label: "Total Views", value: summary ? summary.totalViews.toLocaleString() : "0", icon: "👁️", color: "#6366f1" },
          { label: "Total Likes", value: summary ? summary.totalLikes.toLocaleString() : "0", icon: "❤️", color: "#ec4899" },
          { label: "Comments", value: summary ? summary.totalComments.toLocaleString() : "0", icon: "💬", color: "#3b82f6" },
          { label: "Watch Time (Hours)", value: summary ? `${summary.totalWatchTimeHours} hrs` : "0 hrs", icon: "⏱️", color: "#10b981" },
          { label: "Published Videos", value: summary ? summary.publishedContentCount.toString() : "0", icon: "🎬", color: "#f59e0b" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                {kpi.label}
              </span>
              <span style={{ fontSize: "16px" }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: kpi.color }}>
              {isLoadingSummary ? "..." : kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Content Performance Leaderboard */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 14px", color: "var(--text-primary)" }}>
          Active Video Performance
        </h2>

        {isLoadingContents ? (
          <div style={{ height: "160px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", animation: "pulse 1.5s infinite" }} />
        ) : publishedVideos.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📈</div>
            <h3 style={{ margin: "0 0 4px", fontSize: "15px", color: "var(--text-primary)" }}>
              No Published Analytics History
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              Publish your first video to begin collecting time-series performance telemetry.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {publishedVideos.map((video: ContentDto) => (
              <div
                key={video.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {video.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Type: {video.contentType} • Niche: {video.niche} • Status: {video.status}
                  </div>
                </div>

                <Link
                  href={`/dashboard/content/${video.id}`}
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    color: "#818cf8",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  View Interactive Time-Series →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
