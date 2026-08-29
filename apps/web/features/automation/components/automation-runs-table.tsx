"use client";

import React from "react";
import { useListAutomationRunsQuery } from "../api/automationApi";
import type { AutomationRunDto } from "@repo/types";

interface AutomationRunsTableProps {
  ruleId?: string;
  limit?: number;
}

const STATUS_CONFIG: Record<
  AutomationRunDto["status"],
  { label: string; color: string; bg: string }
> = {
  queued: { label: "Queued", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  running: { label: "Running", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  completed: { label: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  failed: { label: "Failed", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

function StageProgress({ stages }: { stages: AutomationRunDto["stages"] }) {
  const total = stages.length;
  const completed = stages.filter((s) => s.status === "completed").length;
  const failed = stages.filter((s) => s.status === "failed").length;
  const width = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          height: "4px",
          borderRadius: "2px",
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden",
          marginBottom: "4px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background:
              failed > 0
                ? "linear-gradient(90deg, #10b981, #ef4444)"
                : "linear-gradient(90deg, #6366f1, #10b981)",
            transition: "width 0.5s ease",
            borderRadius: "2px",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {stages.map((s) => {
          const dot =
            s.status === "completed"
              ? "#10b981"
              : s.status === "failed"
                ? "#ef4444"
                : s.status === "running"
                  ? "#6366f1"
                  : "rgba(255,255,255,0.2)";
          return (
            <div
              key={s.stage}
              title={`${s.stage}: ${s.status}`}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: dot,
                boxShadow:
                  s.status === "running" ? `0 0 4px ${dot}` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function RunRow({ run }: { run: AutomationRunDto }) {
  const status = STATUS_CONFIG[run.status];
  const duration =
    run.durationMs != null
      ? run.durationMs < 60000
        ? `${Math.round(run.durationMs / 1000)}s`
        : `${(run.durationMs / 60000).toFixed(1)}m`
      : "—";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        alignItems: "center",
        gap: "16px",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "10px",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
    >
      {/* Stages + triggered by */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "4px",
              padding: "1px 6px",
            }}
          >
            via {run.triggeredBy}
          </span>
          {run.contentId && (
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              content: {run.contentId.slice(-6)}
            </span>
          )}
        </div>
        <StageProgress stages={run.stages} />
        {run.errorMessage && (
          <div style={{ fontSize: "11px", color: "#f87171", marginTop: "6px" }}>
            ⚠ {run.errorMessage}
          </div>
        )}
      </div>

      {/* Status badge */}
      <span
        style={{
          background: status.bg,
          color: status.color,
          border: `1px solid ${status.color}30`,
          borderRadius: "6px",
          padding: "4px 10px",
          fontSize: "11px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {status.label}
      </span>

      {/* Duration */}
      <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
        {duration}
      </span>

      {/* Started at */}
      <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", textAlign: "right" }}>
        {new Date(run.startedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

export function AutomationRunsTable({ ruleId, limit = 20 }: AutomationRunsTableProps) {
  const { data: runs = [], isLoading } = useListAutomationRunsQuery({ ruleId, limit });

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "72px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.03)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div
        style={{
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "12px",
          border: "1px dashed rgba(255,255,255,0.08)",
        }}
      >
        No automation runs yet. Trigger a rule to see execution history here.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {runs.map((run) => (
        <RunRow key={run.id} run={run} />
      ))}
    </div>
  );
}
