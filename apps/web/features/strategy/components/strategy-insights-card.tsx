"use client";

import React from "react";
import { useGetStrategyInsightsQuery } from "../api/strategyApi";

export function StrategyInsightsCard() {
  const { data: insights, isLoading } = useGetStrategyInsightsQuery();

  if (isLoading) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          height: "220px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    );
  }

  if (!insights) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "16px",
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🧠
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Autonomous Strategist Insights
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
              Continuous feedback loop tuned from multi-platform analytics
            </p>
          </div>
        </div>

        {/* Opportunity Score Badge */}
        <div
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "10px",
            padding: "6px 14px",
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Strategy Index
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#22c55e", lineHeight: 1.1 }}>
            {insights.opportunityScore}/100
          </div>
        </div>
      </div>

      {/* Grid of Strategy Parameters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Recommended Format Ratio */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px",
            padding: "12px 14px",
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>
            Format Balance
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8" }}>
              {insights.suggestedFormatBalance.shortsPercent}% Shorts
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#f87171" }}>
              {insights.suggestedFormatBalance.longFormPercent}% Long
            </span>
          </div>
          <div
            style={{
              height: "4px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
              marginTop: "8px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                width: `${insights.suggestedFormatBalance.shortsPercent}%`,
                background: "#818cf8",
              }}
            />
            <div
              style={{
                width: `${insights.suggestedFormatBalance.longFormPercent}%`,
                background: "#f87171",
              }}
            />
          </div>
        </div>

        {/* Peak Velocity Time */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px",
            padding: "12px 14px",
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>
            Peak Publishing Window
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
            {insights.bestPostingHours[0]
              ? `${insights.bestPostingHours[0].dayOfWeek} at ${insights.bestPostingHours[0].hour}:00 EST`
              : "11:00 AM - 3:00 PM EST"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Delivers highest first-hour algorithmic velocity
          </div>
        </div>

        {/* Top Growth Observations */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px",
            padding: "12px 14px",
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>
            Growth Observation
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4 }}>
            {insights.growthObservations[0] || "Targeting high-CTR opening hooks boosts 30s retention."}
          </div>
        </div>
      </div>
    </div>
  );
}
