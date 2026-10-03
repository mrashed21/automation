"use client";

import { useGetContentsQuery } from "@/features/content/api/content-api";
import { StatsRow } from "@/features/dashboard/components/stats-row";
import type { ContentDto } from "@repo/types";
import { ArrowRight, BarChart3, Plus, Radio, Sparkles, Video, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: contentsData, isLoading } = useGetContentsQuery({ limit: 6 });
  const recentItems: ContentDto[] = contentsData?.data || [];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Top Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(236,72,153,0.04) 100%)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "20px",
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)",
        }}
      >
        {/* Background glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="glow-pill bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Sparkles className="h-3 w-3 text-indigo-400" /> Enterprise Operations
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">• Autonomous Cloud v0.9.0</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Operations Control Center
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] max-w-xl">
              Autonomous multi-platform video generation, neural voice synthesis, and real-time algorithmic strategy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/strategy"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Discover Topics with AI
            </Link>
            <Link
              href="/dashboard/content"
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:bg-white/[0.08] transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Video Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <StatsRow />

      {/* Quick Launch Studios Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Core Production Studios
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Autonomous Strategist",
              desc: "Viral trend discovery & opening hook generator",
              icon: Sparkles,
              href: "/dashboard/strategy",
              accent: "#818cf8",
              gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
              badge: "AI Powered",
            },
            {
              title: "Automation Engine",
              desc: "Scheduled cron jobs & HMAC webhook triggers",
              icon: Zap,
              href: "/dashboard/automation",
              accent: "#fbbf24",
              gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
              badge: "n8n Integrated",
            },
            {
              title: "Publishing Hub",
              desc: "YouTube & Meta distribution with safe disclosures",
              icon: Radio,
              href: "/dashboard/publishing",
              accent: "#f87171",
              gradient: "from-red-500/10 via-red-500/5 to-transparent",
              badge: "Multi-Platform",
            },
            {
              title: "Analytics Studio",
              desc: "Interactive Recharts growth curves & viewer retention",
              icon: BarChart3,
              href: "/dashboard/analytics",
              accent: "#34d399",
              gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
              badge: "Live Telemetry",
            },
          ].map((studio) => {
            const Icon = studio.icon;
            return (
              <Link
                key={studio.title}
                href={studio.href}
                className="group relative rounded-2xl border border-[var(--border)] bg-gradient-to-br p-5 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 shadow-sm"
                    style={{
                      background: `${studio.accent}18`,
                      border: `1px solid ${studio.accent}35`,
                      color: studio.accent,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: `${studio.accent}14`,
                      color: studio.accent,
                      border: `1px solid ${studio.accent}30`,
                    }}
                  >
                    {studio.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">
                  {studio.title}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
                  {studio.desc}
                </p>

                <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 mt-4 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <span>Enter Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Content Pipeline Activity */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              Active Content Pipeline ({contentsData?.pagination?.total || 0})
            </h2>
          </div>
          <Link
            href="/dashboard/content"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <span>View Full Library</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="h-36 rounded-xl bg-white/[0.02] animate-pulse" />
        ) : recentItems.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[var(--border)] rounded-xl">
            <Video className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
            <p className="text-xs text-[var(--muted-foreground)]">No active content in this workspace yet.</p>
            <Link
              href="/dashboard/strategy"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Discover Topics with AI
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentItems.map((item: ContentDto) => {
              const isShort = item.contentType.includes("short") || item.contentType.includes("reel");
              const isPublished = item.status === "published";
              const isScheduled = item.status === "scheduled";

              const statusColor = isPublished ? "#22c55e" : isScheduled ? "#6366f1" : "#f59e0b";

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0"
                      style={{
                        background: isShort ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.12)",
                        color: isShort ? "#f87171" : "#818cf8",
                        border: `1px solid ${isShort ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.25)"}`,
                      }}
                    >
                      {isShort ? "9:16 Short" : "16:9 Long"}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--foreground)] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-2 mt-0.5">
                        <span>{item.niche || "General"}</span>
                        <span>•</span>
                        <span style={{ color: statusColor, fontWeight: 600 }}>
                          ● {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/content/${item.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5 hover:bg-indigo-500/20 transition-colors shrink-0 self-start sm:self-auto"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
