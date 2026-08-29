"use client";

import React, { useState } from "react";
import { useGetAutomationStatusQuery } from "@/features/automation/api/automationApi";
import { AutomationRulesList } from "@/features/automation/components/automation-rules-list";
import { CreateRuleDialog } from "@/features/automation/components/create-rule-dialog";
import { AutomationRunsTable } from "@/features/automation/components/automation-runs-table";
import type { AutomationRuleDto } from "@repo/types";

function StatusPill({
  label,
  status,
}: {
  label: string;
  status: "healthy" | "warning" | "offline";
}) {
  const colors = {
    healthy: { dot: "#22c55e", text: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
    warning: { dot: "#f59e0b", text: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    offline: { dot: "#6b7280", text: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)" },
  }[status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "8px",
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: 600,
        color: colors.text,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: colors.dot,
          boxShadow: status === "healthy" ? `0 0 5px ${colors.dot}` : "none",
          animation: status === "healthy" ? "pulse-glow 2s ease-in-out infinite" : "none",
        }}
      />
      {label}
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
  icon,
}: {
  value: string | number;
  label: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}10 0%, rgba(0,0,0,0) 70%)`,
        border: `1px solid ${color}20`,
        borderRadius: "14px",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color, opacity: 0.7 }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

export default function AutomationPage() {
  const { data: status } = useGetAutomationStatusQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<AutomationRuleDto | null>(null);
  const [activeSection, setActiveSection] = useState<"rules" | "runs">("rules");

  const handleCreateClick = () => {
    setEditRule(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (rule: AutomationRuleDto) => {
    setEditRule(rule);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditRule(null);
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
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Automation Engine
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Autonomous content production pipeline with n8n webhook integration
            </p>
          </div>
        </div>
      </div>

      {/* System health strip */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          padding: "14px 18px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
          marginBottom: "24px",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px" }}>
          System Health
        </span>
        <StatusPill label="API" status="healthy" />
        <StatusPill label="MongoDB" status="healthy" />
        <StatusPill label="Redis" status="healthy" />
        <StatusPill label="Worker" status="healthy" />
        <StatusPill label="Media Worker" status="healthy" />
        <StatusPill label="n8n" status={status ? "healthy" : "offline"} />
      </div>

      {/* Stats row */}
      {status && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          <StatCard
            value={status.totalRules}
            label="Total Rules"
            color="#6366f1"
            icon="📋"
          />
          <StatCard
            value={status.enabledRules}
            label="Active Rules"
            color="#10b981"
            icon="✅"
          />
          <StatCard
            value={status.successfulRunsToday}
            label="Completed Today"
            color="#22c55e"
            icon="🎯"
          />
          <StatCard
            value={status.failedRunsToday}
            label="Failed Today"
            color={status.failedRunsToday > 0 ? "#ef4444" : "#6b7280"}
            icon="⚠️"
          />
          <StatCard
            value={status.queuedJobs}
            label="Queued"
            color="#f59e0b"
            icon="⏳"
          />
        </div>
      )}

      {/* Section header with create button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "12px" }}>
        {/* Tab selector */}
        <div style={{ display: "flex", gap: "0", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["rules", "runs"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              style={{
                background: activeSection === s ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                color: activeSection === s ? "#818cf8" : "var(--text-muted)",
                border: "none",
                padding: "9px 20px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {s === "rules" ? "⚙️ Rules" : "📜 Run History"}
            </button>
          ))}
        </div>

        {/* Create button */}
        <button
          id="create-automation-rule-btn"
          onClick={handleCreateClick}
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
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(99,102,241,0.5)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "16px" }}>+</span>
          New Rule
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        {activeSection === "rules" ? (
          <AutomationRulesList
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
          />
        ) : (
          <AutomationRunsTable limit={30} />
        )}
      </div>

      {/* Webhook info box */}
      <div
        style={{
          marginTop: "20px",
          padding: "16px 20px",
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: "12px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "20px", flexShrink: 0 }}>🔗</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#818cf8", marginBottom: "4px" }}>
            n8n Webhook Integration
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Trigger any automation rule via POST{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: "4px",
                padding: "1px 6px",
                fontFamily: "monospace",
                fontSize: "11px",
                color: "#c4b5fd",
              }}
            >
              /api/v1/automation/webhook/:ruleId
            </code>{" "}
            with the HMAC signature in the{" "}
            <code style={{ fontFamily: "monospace", fontSize: "11px", color: "#c4b5fd" }}>
              x-webhook-signature
            </code>{" "}
            header. Configure{" "}
            <code style={{ fontFamily: "monospace", fontSize: "11px", color: "#c4b5fd" }}>
              N8N_WEBHOOK_SECRET
            </code>{" "}
            in your environment file to enable signature verification.
          </div>
        </div>
      </div>

      {/* Create/Edit dialog */}
      <CreateRuleDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        editRule={editRule}
      />
    </div>
  );
}
