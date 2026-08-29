"use client";

import React, { useState } from "react";
import {
  useListOpportunitiesQuery,
  useDiscoverOpportunitiesMutation,
} from "@/features/strategy/api/strategyApi";
import { StrategyInsightsCard } from "@/features/strategy/components/strategy-insights-card";
import { OpportunityCard } from "@/features/strategy/components/opportunity-card";
import type { OpportunityStatus } from "@repo/types";

export default function StrategyPage() {
  const [filterFormat, setFilterFormat] = useState<"all" | "shorts" | "long-form">("all");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | "all">("suggested");
  const [nicheInput, setNicheInput] = useState("AI & Automation");
  const [formatInput, setFormatInput] = useState<"any" | "shorts" | "long-form">("any");
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);

  const { data: rawOpportunities = [], isLoading } = useListOpportunitiesQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );

  const [discoverTopics, { isLoading: isDiscovering }] = useDiscoverOpportunitiesMutation();

  const opportunities = rawOpportunities.filter((opp) => {
    if (filterFormat === "all") return true;
    return opp.format === filterFormat;
  });

  const handleDiscoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await discoverTopics({
        niche: nicheInput.trim(),
        format: formatInput,
        count: 4,
      }).unwrap();
      setIsDiscoverModalOpen(false);
    } catch {
      // handled by RTK
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px 32px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
            }}
          >
            🎯
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Autonomous Strategist
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Continuous opportunity discovery & multi-platform trend optimization
            </p>
          </div>
        </div>

        {/* Discover Button */}
        <button
          id="discover-topics-btn"
          onClick={() => setIsDiscoverModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            transition: "all 0.2s",
          }}
        >
          <span>✨</span>
          Discover Topics
        </button>
      </div>

      {/* Strategic Insights Card */}
      <div style={{ marginBottom: "28px" }}>
        <StrategyInsightsCard />
      </div>

      {/* Filter and Status tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Status filters */}
        <div style={{ display: "flex", gap: "0", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {(
            [
              { key: "suggested", label: "💡 Suggested" },
              { key: "in-production", label: "⚙️ In Production" },
              { key: "all", label: "📋 All Opportunities" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              style={{
                background: statusFilter === s.key ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                color: statusFilter === s.key ? "#818cf8" : "var(--text-muted)",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Format tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "shorts", "long-form"] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFilterFormat(fmt)}
              style={{
                background: filterFormat === fmt ? "rgba(255,255,255,0.1)" : "transparent",
                color: filterFormat === fmt ? "var(--text-primary)" : "var(--text-muted)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {fmt === "all" ? "All Formats" : fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "220px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "16px",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "12px" }}>🎯</div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "var(--text-primary)" }}>
            No Opportunities in this View
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "360px", margin: "0 auto 18px" }}>
            Trigger the AI Strategist Agent to analyze trends and discover high-potential topic candidates.
          </p>
          <button
            onClick={() => setIsDiscoverModalOpen(true)}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Run Topic Discovery
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}

      {/* Discovery Modal */}
      {isDiscoverModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDiscoverModalOpen(false);
          }}
        >
          <div
            style={{
              background: "var(--sidebar-bg, rgba(13,13,18,0.97))",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "18px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                AI Topic Discovery Parameters
              </h2>
              <button
                onClick={() => setIsDiscoverModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDiscoverSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase" }}>
                  Target Niche / Category
                </label>
                <input
                  type="text"
                  value={nicheInput}
                  onChange={(e) => setNicheInput(e.target.value)}
                  placeholder="e.g. AI Automation, Tech Tutorials"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase" }}>
                  Format Focus
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["any", "shorts", "long-form"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormatInput(fmt)}
                      style={{
                        flex: 1,
                        background: formatInput === fmt ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${formatInput === fmt ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "8px",
                        padding: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: formatInput === fmt ? "#818cf8" : "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {fmt === "any" ? "Balanced" : fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsDiscoverModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDiscovering}
                  style={{
                    background: isDiscovering
                      ? "rgba(99,102,241,0.4)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isDiscovering ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isDiscovering ? (
                    <>
                      <span style={{ animation: "spin 1s linear infinite" }}>⟳</span>
                      Discovering Opportunities...
                    </>
                  ) : (
                    "Launch Discovery"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
