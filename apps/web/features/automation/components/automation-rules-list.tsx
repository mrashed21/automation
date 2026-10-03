"use client";

import type { AutomationRuleDto } from "@repo/types";
import { useState } from "react";
import {
  useDeleteAutomationRuleMutation,
  useListAutomationRulesQuery,
  useToggleAutomationRuleMutation,
  useTriggerAutomationRuleMutation,
} from "../api/automationApi";

interface AutomationRulesListProps {
  onCreateClick: () => void;
  onEditClick: (rule: AutomationRuleDto) => void;
}

const TRIGGER_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  cron: { label: "Scheduled", icon: "⏰", color: "#f59e0b" },
  webhook: { label: "Webhook", icon: "🔗", color: "#6366f1" },
  manual: { label: "Manual", icon: "▶️", color: "#10b981" },
};

const APPROVAL_LABELS: Record<string, { label: string; color: string }> = {
  "full-auto": { label: "Full Auto", color: "#10b981" },
  "approval-required": { label: "Approval Required", color: "#f59e0b" },
  hybrid: { label: "Hybrid", color: "#6366f1" },
};

function RuleCard({
  rule,
  onEdit,
  onToggle,
  onDelete,
  onTrigger,
}: {
  rule: AutomationRuleDto;
  onEdit: () => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
  onTrigger: () => void;
}) {
  const trigger = TRIGGER_LABELS[rule.trigger] ?? { label: rule.trigger, icon: "⚡", color: "#6366f1" };
  const approval = APPROVAL_LABELS[rule.approvalMode] ?? { label: rule.approvalMode, color: "#6b7280" };

  return (
    <div
      style={{
        background: rule.isEnabled
          ? "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(0,0,0,0) 60%)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${rule.isEnabled ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "14px",
        padding: "20px 22px",
        transition: "all 0.25s",
        opacity: rule.isEnabled ? 1 : 0.6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        {/* Left — rule info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: "18px" }}>{trigger.icon}</span>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {rule.name}
            </h3>
            {/* Status dot */}
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: rule.isEnabled ? "#22c55e" : "#6b7280",
                boxShadow: rule.isEnabled ? "0 0 6px #22c55e" : "none",
                flexShrink: 0,
              }}
            />
          </div>

          {/* Tags row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            <span
              style={{
                background: `${trigger.color}18`,
                color: trigger.color,
                border: `1px solid ${trigger.color}30`,
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {trigger.label}
            </span>
            <span
              style={{
                background: `${approval.color}18`,
                color: approval.color,
                border: `1px solid ${approval.color}30`,
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {approval.label}
            </span>
            {rule.platforms.map((p) => (
              <span
                key={p}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text-muted)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  textTransform: "capitalize",
                }}
              >
                {p}
              </span>
            ))}
            <span
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-muted)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "11px",
              }}
            >
              {rule.dailyTarget} content/run
            </span>
          </div>

          {/* Meta info */}
          <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", gap: "14px", flexWrap: "wrap" }}>
            {rule.cronExpression && (
              <span>
                <span style={{ opacity: 0.6 }}>Cron: </span>
                <code style={{ fontFamily: "monospace", color: "#f59e0b" }}>{rule.cronExpression}</code>
              </span>
            )}
            {rule.lastRunAt && (
              <span>
                Last run: {new Date(rule.lastRunAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
              </span>
            )}
          </div>
        </div>

        {/* Right — actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
          {/* Toggle switch */}
          <label
            style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)", userSelect: "none" }}
          >
            <span>{rule.isEnabled ? "Enabled" : "Disabled"}</span>
            <div
              onClick={() => onToggle(!rule.isEnabled)}
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "10px",
                background: rule.isEnabled ? "#6366f1" : "rgba(255,255,255,0.1)",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: rule.isEnabled ? "17px" : "2px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </label>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <ActionBtn icon="▶" title="Run Now" color="#10b981" onClick={onTrigger} />
            <ActionBtn icon="✏️" title="Edit" color="#6366f1" onClick={onEdit} />
            <ActionBtn icon="🗑" title="Delete" color="#ef4444" onClick={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  title,
  color,
  onClick,
}: {
  icon: string;
  title: string;
  color: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `${color}22` : "rgba(255,255,255,0.05)",
        border: `1px solid ${hovered ? `${color}44` : "rgba(255,255,255,0.08)"}`,
        borderRadius: "8px",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "13px",
        transition: "all 0.15s",
        color: hovered ? color : "var(--text-muted)",
      }}
    >
      {icon}
    </button>
  );
}

export function AutomationRulesList({ onCreateClick, onEditClick }: AutomationRulesListProps) {
  const { data: rules = [], isLoading } = useListAutomationRulesQuery();
  const [toggleRule] = useToggleAutomationRuleMutation();
  const [deleteRule] = useDeleteAutomationRuleMutation();
  const [triggerRule] = useTriggerAutomationRuleMutation();

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "120px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 24px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "16px",
          border: "1px dashed rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚡</div>
        <h4 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px", color: "var(--text-primary)" }}>
          No Automation Rules Yet
        </h4>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "360px", margin: "0 auto 20px" }}>
          Create your first automation rule to start producing content on a schedule or via webhook trigger.
        </p>
        <button
          id="create-first-rule-btn"
          onClick={onCreateClick}
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
          + Create First Rule
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          onEdit={() => onEditClick(rule)}
          onToggle={(enabled) => toggleRule({ id: rule.id, isEnabled: enabled })}
          onDelete={() => {
            if (confirm(`Delete automation rule "${rule.name}"?`)) {
              void deleteRule(rule.id);
            }
          }}
          onTrigger={() => void triggerRule(rule.id)}
        />
      ))}
    </div>
  );
}
