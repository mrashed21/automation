"use client";

import type { ContentOpportunityDto } from "@repo/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useDismissOpportunityMutation,
  useProduceFromOpportunityMutation,
} from "../api/strategyApi";

interface OpportunityCardProps {
  opportunity: ContentOpportunityDto;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const router = useRouter();
  const [produce, { isLoading: isProducing }] = useProduceFromOpportunityMutation();
  const [dismiss, { isLoading: isDismissing }] = useDismissOpportunityMutation();
  const [showHooks, setShowHooks] = useState(false);

  const isShorts = opportunity.format === "shorts";
  const scoreColor =
    opportunity.estimatedScore >= 90
      ? "#22c55e"
      : opportunity.estimatedScore >= 80
        ? "#6366f1"
        : "#f59e0b";

  const handleProduce = async () => {
    try {
      const res = await produce(opportunity.id).unwrap();
      router.push(`/dashboard/content/${res.contentId}`);
    } catch {
      // handled by RTK
    }
  };

  const handleDismiss = async () => {
    try {
      await dismiss(opportunity.id).unwrap();
    } catch {
      // handled by RTK
    }
  };

  if (opportunity.status === "rejected") {
    return null;
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(99,102,241,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s ease",
      }}
    >
      {/* Top row: Format badge + Viral Score meter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: isShorts ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
              color: isShorts ? "#f87171" : "#818cf8",
              border: `1px solid ${isShorts ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"}`,
              borderRadius: "6px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {isShorts ? "⚡ Shorts (9:16)" : "🎬 Long-Form (16:9)"}
          </span>
          {opportunity.niche && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.04)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              {opportunity.niche}
            </span>
          )}
        </div>

        {/* Viral Score Meter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: `${scoreColor}14`,
            border: `1px solid ${scoreColor}35`,
            borderRadius: "8px",
            padding: "3px 10px",
          }}
        >
          <span style={{ fontSize: "12px" }}>🔥</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: scoreColor }}>
            {opportunity.estimatedScore}%
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Potential
          </span>
        </div>
      </div>

      {/* Topic Title */}
      <div>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 6px",
            lineHeight: 1.4,
          }}
        >
          {opportunity.topic}
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
          {opportunity.rationale}
        </p>
      </div>

      {/* Keywords */}
      {opportunity.keywords && opportunity.keywords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {opportunity.keywords.map((kw) => (
            <span
              key={kw}
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "4px",
                padding: "1px 6px",
              }}
            >
              #{kw}
            </span>
          ))}
        </div>
      )}

      {/* Suggested Hooks accordion */}
      {opportunity.suggestedHooks && opportunity.suggestedHooks.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
          <button
            onClick={() => setShowHooks(!showHooks)}
            style={{
              background: "transparent",
              border: "none",
              color: "#818cf8",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{showHooks ? "▼" : "▶"}</span>
            <span>{opportunity.suggestedHooks.length} Suggested Opening Hooks (0-3s)</span>
          </button>

          {showHooks && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
              {opportunity.suggestedHooks.map((hook, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "11px",
                    color: "var(--text-primary)",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{hook}&rdquo;
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
          paddingTop: "6px",
        }}
      >
        <button
          onClick={handleDismiss}
          disabled={isDismissing || isProducing}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "6px 12px",
            color: "var(--text-muted)",
            fontSize: "12px",
            cursor: isDismissing ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isDismissing ? "Dismissing..." : "Dismiss"}
        </button>

        <button
          id={`produce-btn-${opportunity.id}`}
          onClick={handleProduce}
          disabled={isProducing || isDismissing}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "7px 16px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: isProducing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
          }}
        >
          {isProducing ? (
            <>
              <span style={{ animation: "spin 1s linear infinite" }}>⟳</span>
              Launching Pipeline...
            </>
          ) : (
            <>
              <span>✨</span>
              Produce Video
            </>
          )}
        </button>
      </div>
    </div>
  );
}
