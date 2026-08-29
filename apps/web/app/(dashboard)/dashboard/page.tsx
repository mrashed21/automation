"use client";

import React from "react";
import Link from "next/link";
import { StatsRow } from "@/features/dashboard/components/stats-row";
import { useGetContentsQuery } from "@/features/content/api/content-api";
import type { ContentDto } from "@repo/types";

export default function DashboardPage() {
  const { data: contentsData, isLoading } = useGetContentsQuery({ limit: 5 });
  const recentItems: ContentDto[] = contentsData?.data || [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4px 0", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Command Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Overview of content production, autonomous pipelines, and audience engagement
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/dashboard/strategy"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              borderRadius: "10px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            }}
          >
            <span>🎯</span> AI Strategist
          </Link>
          <Link
            href="/dashboard/content"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)",
              borderRadius: "10px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + New Content
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <StatsRow />

      {/* Quick Launch Hub */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {[
          { title: "Autonomous Strategist", desc: "Trend discovery & viral potential scoring", icon: "🧠", href: "/dashboard/strategy", color: "#6366f1" },
          { title: "Automation Engine", desc: "Scheduled cron jobs & n8n webhook triggers", icon: "⚡", href: "/dashboard/automation", color: "#f59e0b" },
          { title: "Publishing Hub", desc: "Connected YouTube & Facebook distribution", icon: "📡", href: "/dashboard/publishing", color: "#ef4444" },
          { title: "Analytics Studio", desc: "Multi-platform growth curves & engagement", icon: "📊", href: "/dashboard/analytics", color: "#10b981" },
        ].map((hub) => (
          <Link
            key={hub.title}
            href={hub.href}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "18px 20px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>{hub.icon}</span>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                {hub.title}
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              {hub.desc}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Content Pipeline Activity */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Recent Content Pipeline Activity
          </h2>
          <Link
            href="/dashboard/content"
            style={{ fontSize: "12px", color: "#818cf8", textDecoration: "none", fontWeight: 600 }}
          >
            View all content ({contentsData?.pagination?.total || 0}) →
          </Link>
        </div>

        {isLoading ? (
          <div style={{ height: "140px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", animation: "pulse 1.5s infinite" }} />
        ) : recentItems.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "36px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--text-muted)" }}>
              No content created in this workspace yet.
            </p>
            <Link
              href="/dashboard/strategy"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Discover Topics with AI
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentItems.map((item: ContentDto) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {item.contentType} • {item.language} • Status:{" "}
                    <span style={{ color: "#818cf8", fontWeight: 600 }}>{item.status}</span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/content/${item.id}`}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Open Studio →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
