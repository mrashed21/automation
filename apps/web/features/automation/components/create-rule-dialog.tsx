"use client";

import type { AutomationRuleDto } from "@repo/types";
import React, { useState } from "react";
import {
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
} from "../api/automationApi";

interface CreateRuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editRule?: AutomationRuleDto | null;
}

const PLATFORMS = ["youtube", "facebook", "instagram", "tiktok"];
const APPROVAL_MODES = [
  { value: "full-auto", label: "Full Auto — publish without human approval" },
  { value: "approval-required", label: "Approval Required — pause before publishing" },
  { value: "hybrid", label: "Hybrid — auto for shorts, approval for long-form" },
] as const;

const CRON_PRESETS = [
  { label: "Daily at 9 AM", value: "0 9 * * *" },
  { label: "Daily at 3 PM", value: "0 15 * * *" },
  { label: "Every 12 hours", value: "0 */12 * * *" },
  { label: "Mon–Fri at 8 AM", value: "0 8 * * 1-5" },
  { label: "Every Sunday", value: "0 10 * * 0" },
  { label: "Custom", value: "" },
];

export function CreateRuleDialog({ isOpen, onClose, editRule }: CreateRuleDialogProps) {
  const [createRule, { isLoading: isCreating }] = useCreateAutomationRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateAutomationRuleMutation();

  const [name, setName] = useState(editRule?.name ?? "");
  const [trigger, setTrigger] = useState<"cron" | "webhook" | "manual">(
    editRule?.trigger ?? "cron",
  );
  const [cronPreset, setCronPreset] = useState(
    editRule?.cronExpression ? "" : "0 9 * * *",
  );
  const [cronExpression, setCronExpression] = useState(
    editRule?.cronExpression ?? "0 9 * * *",
  );
  const [platforms, setPlatforms] = useState<string[]>(
    editRule?.platforms ?? ["youtube"],
  );
  const [dailyTarget, setDailyTarget] = useState(editRule?.dailyTarget ?? 1);
  const [approvalMode, setApprovalMode] = useState<"full-auto" | "approval-required" | "hybrid">(
    editRule?.approvalMode ?? "full-auto",
  );
  const [error, setError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  if (!isOpen) return null;

  const togglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const handlePresetChange = (value: string) => {
    setCronPreset(value);
    if (value) setCronExpression(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Rule name is required");
      return;
    }
    if (platforms.length === 0) {
      setError("Select at least one platform");
      return;
    }
    if (trigger === "cron" && !cronExpression.trim()) {
      setError("Cron expression is required for scheduled trigger");
      return;
    }

    const payload = {
      name: name.trim(),
      trigger,
      cronExpression: trigger === "cron" ? cronExpression.trim() : null,
      platforms,
      dailyTarget,
      approvalMode,
    };

    try {
      if (editRule) {
        await updateRule({ id: editRule.id, data: payload }).unwrap();
      } else {
        await createRule(payload).unwrap();
      }
      onClose();
    } catch {
      setError("Failed to save automation rule. Please try again.");
    }
  };

  return (
    /* Backdrop */
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--sidebar-bg, rgba(13,13,18,0.97))",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          padding: "28px",
          width: "100%",
          maxWidth: "540px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              {editRule ? "Edit Automation Rule" : "Create Automation Rule"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
              Define how and when content should be automatically produced
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: "16px",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Rule Name */}
          <div>
            <label style={labelStyle}>Rule Name</label>
            <input
              id="rule-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily YouTube Tech Videos"
              style={inputStyle}
            />
          </div>

          {/* Trigger type */}
          <div>
            <label style={labelStyle}>Trigger Type</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["cron", "webhook", "manual"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrigger(t)}
                  style={{
                    flex: 1,
                    background: trigger === t ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${trigger === t ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "8px",
                    padding: "10px 8px",
                    cursor: "pointer",
                    color: trigger === t ? "#818cf8" : "var(--text-muted)",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                >
                  {t === "cron" ? "⏰ Scheduled" : t === "webhook" ? "🔗 Webhook" : "▶ Manual"}
                </button>
              ))}
            </div>
          </div>

          {/* Cron expression — shown only for cron trigger */}
          {trigger === "cron" && (
            <div>
              <label style={labelStyle}>Schedule</label>
              <select
                value={cronPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                style={{ ...inputStyle, marginBottom: "8px" }}
              >
                {CRON_PRESETS.map((p) => (
                  <option key={p.label} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => {
                  setCronExpression(e.target.value);
                  setCronPreset(""); // mark as custom
                }}
                placeholder="0 9 * * *"
                style={{ ...inputStyle, fontFamily: "monospace", fontSize: "13px" }}
              />
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Standard 5-field cron: minute hour day-of-month month day-of-week
              </div>
            </div>
          )}

          {/* Platforms */}
          <div>
            <label style={labelStyle}>Target Platforms</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {PLATFORMS.map((p) => {
                const selected = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    style={{
                      background: selected ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${selected ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: "8px",
                      padding: "7px 14px",
                      cursor: "pointer",
                      color: selected ? "#818cf8" : "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      transition: "all 0.2s",
                    }}
                  >
                    {selected ? "✓ " : ""}{p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily target */}
          <div>
            <label style={labelStyle}>
              Content Per Run — <strong style={{ color: "#818cf8" }}>{dailyTarget}</strong>
            </label>
            <input
              id="daily-target-slider"
              type="range"
              min={1}
              max={10}
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)" }}>
              <span>1</span><span>5</span><span>10</span>
            </div>
          </div>

          {/* Approval mode */}
          <div>
            <label style={labelStyle}>Approval Mode</label>
            <select
              id="approval-mode-select"
              value={approvalMode}
              onChange={(e) => setApprovalMode(e.target.value as typeof approvalMode)}
              style={inputStyle}
            >
              {APPROVAL_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              id="save-rule-btn"
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                cursor: isLoading ? "not-allowed" : "pointer",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              {isLoading ? "Saving..." : editRule ? "Save Changes" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};
