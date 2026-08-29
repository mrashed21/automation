"use client";

import React, { useState } from "react";
import {
  useGetLatestAnalyticsQuery,
  useGetAnalyticsSnapshotsQuery,
  useSyncAnalyticsMutation,
} from "../api/analyticsApi";
import type { ContentDto, AnalyticsSnapshotDto } from "@repo/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsTabViewProps {
  content: ContentDto;
}

type MetricKey = "views" | "likes" | "comments" | "shares";

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#ff0000",
  facebook: "#1877f2",
  instagram: "#e1306c",
  tiktok: "#010101",
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatWatchTime(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const h = (seconds / 3600).toFixed(1);
  return `${h}h`;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  delta?: string | null;
}

function MetricCard({ label, value, icon, color, delta }: MetricCardProps) {
  return (
    <div
      style={{
        background: "var(--card-bg, rgba(255,255,255,0.04))",
        border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
        borderRadius: "12px",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Accent glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: color,
          opacity: 0.8,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      {delta && (
        <div style={{ fontSize: "11px", color: "var(--color-success, #22c55e)", fontWeight: 500 }}>
          {delta}
        </div>
      )}
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const color = PLATFORM_COLORS[platform] ?? "#6366f1";
  const label = PLATFORM_LABELS[platform] ?? platform;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
        borderRadius: "6px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

export function AnalyticsTabView({ content }: AnalyticsTabViewProps) {
  const { data: latestMetrics = [], isLoading: isLoadingLatest } =
    useGetLatestAnalyticsQuery(content.id);
  const { data: snapshots = [], isLoading: isLoadingSnapshots } =
    useGetAnalyticsSnapshotsQuery(content.id);
  const [syncAnalytics, { isLoading: isSyncing }] = useSyncAnalyticsMutation();
  const [activeMetric, setActiveMetric] = useState<MetricKey>("views");

  const handleSync = async () => {
    try {
      await syncAnalytics(content.id).unwrap();
    } catch {
      // handled by RTK
    }
  };

  const hasData = latestMetrics.length > 0;
  const isLoading = isLoadingLatest || isLoadingSnapshots;

  // Build chart data from snapshots grouped by date
  const chartData = snapshots.reduce<
    Array<Record<string, string | number>>
  >((acc, snap) => {
    const dateLabel = new Date(snap.capturedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let entry = acc.find((e) => e.date === dateLabel);
    if (!entry) {
      entry = { date: dateLabel };
      acc.push(entry);
    }

    const key = `${snap.platform}_${activeMetric}`;
    entry[key] = snap[activeMetric] ?? 0;
    return acc;
  }, []);

  const platformsInData = Array.from(
    new Set(snapshots.map((s) => s.platform)),
  );

  // Aggregate totals from latest metrics
  const totalViews = latestMetrics.reduce((s, m) => s + m.views, 0);
  const totalLikes = latestMetrics.reduce((s, m) => s + m.likes, 0);
  const totalComments = latestMetrics.reduce((s, m) => s + m.comments, 0);
  const totalShares = latestMetrics.reduce((s, m) => s + m.shares, 0);
  const avgCtr =
    latestMetrics.length > 0
      ? (
          latestMetrics.reduce((s, m) => s + (m.clickThroughRate ?? 0), 0) /
          latestMetrics.length
        ).toFixed(1)
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Analytics & Performance
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Real-time metrics synced from YouTube and Facebook.
          </p>
        </div>

        <button
          id="sync-analytics-btn"
          onClick={handleSync}
          disabled={isSyncing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: isSyncing ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.12)",
            color: "#818cf8",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: isSyncing ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isSyncing)
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.22)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
          }}
        >
          {isSyncing ? (
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
          ) : (
            "⟳"
          )}
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {isLoading ? (
        /* Skeleton */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "90px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : !hasData ? (
        /* Empty state */
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "16px",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h4 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px", color: "var(--text-primary)" }}>
            No Analytics Data Yet
          </h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto 20px" }}>
            Publish this content to YouTube or Facebook, then click{" "}
            <strong>Sync Now</strong> to pull in your performance metrics.
          </p>
        </div>
      ) : (
        <>
          {/* Platform tags */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {latestMetrics.map((m) => (
              <PlatformBadge key={m.platform} platform={m.platform} />
            ))}
          </div>

          {/* Metric cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "14px",
            }}
          >
            <MetricCard
              label="Total Views"
              value={totalViews}
              icon="👁️"
              color="#6366f1"
            />
            <MetricCard
              label="Likes"
              value={totalLikes}
              icon="❤️"
              color="#f43f5e"
            />
            <MetricCard
              label="Comments"
              value={totalComments}
              icon="💬"
              color="#f59e0b"
            />
            <MetricCard
              label="Shares"
              value={totalShares}
              icon="🔁"
              color="#10b981"
            />
            {avgCtr && (
              <MetricCard
                label="Avg CTR"
                value={`${avgCtr}%`}
                icon="🎯"
                color="#8b5cf6"
              />
            )}
          </div>

          {/* Per-platform detail cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {latestMetrics.map((snap: AnalyticsSnapshotDto) => {
              const color = PLATFORM_COLORS[snap.platform] ?? "#6366f1";
              const label = PLATFORM_LABELS[snap.platform] ?? snap.platform;
              return (
                <div
                  key={snap.platform}
                  style={{
                    background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
                    border: `1px solid ${color}25`,
                    borderRadius: "14px",
                    padding: "18px 20px",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr repeat(4, auto)",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "14px", color: color, minWidth: "80px" }}>
                    {label}
                  </div>
                  <div />
                  {[
                    { label: "Views", val: snap.views },
                    { label: "Watch Time", val: formatWatchTime(snap.watchTimeSeconds) },
                    { label: "Avg Duration", val: formatDuration(snap.averageViewDurationSeconds) },
                    { label: "Retention", val: snap.retentionPercent ? `${snap.retentionPercent}%` : "—" },
                  ].map(({ label: l, val }) => (
                    <div
                      key={l}
                      style={{ textAlign: "center", minWidth: "72px" }}
                    >
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>{l}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {typeof val === "number" ? formatNumber(val) : val}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Growth chart */}
          {chartData.length > 1 && (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    Growth Over Time
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Historical performance snapshots
                  </div>
                </div>

                {/* Metric selector */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {(["views", "likes", "comments", "shares"] as MetricKey[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      style={{
                        background: activeMetric === m ? "rgba(99,102,241,0.2)" : "transparent",
                        color: activeMetric === m ? "#818cf8" : "var(--text-muted)",
                        border: activeMetric === m ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                        borderRadius: "6px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: "all 0.2s",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {platformsInData.map((p) => (
                      <linearGradient
                        key={p}
                        id={`grad-${p}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={PLATFORM_COLORS[p] ?? "#6366f1"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PLATFORM_COLORS[p] ?? "#6366f1"} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatNumber(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,15,20,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [formatNumber(value), activeMetric]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {platformsInData.map((p) => (
                    <Area
                      key={p}
                      type="monotone"
                      dataKey={`${p}_${activeMetric}`}
                      name={PLATFORM_LABELS[p] ?? p}
                      stroke={PLATFORM_COLORS[p] ?? "#6366f1"}
                      fill={`url(#grad-${p})`}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Last synced */}
          {latestMetrics[0] && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "right" }}>
              Last synced:{" "}
              {new Date(latestMetrics[0].capturedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
