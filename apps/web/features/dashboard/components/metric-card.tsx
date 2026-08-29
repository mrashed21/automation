"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  id: string;
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  className?: string;
}

export function MetricCard({
  id,
  label,
  value,
  description,
  icon: Icon,
  color = "#6366f1",
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      id={id}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${color}08 100%)`,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
        transition: "all 0.22s ease",
      }}
      className={cn("group hover:border-indigo-500/40 hover:-translate-y-0.5", className)}
    >
      {/* Top accent glow line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          opacity: 0.6,
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] mt-0.5" style={{ color: value === "0" || value === "—" ? undefined : color }}>
            {value}
          </p>
        </div>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: `${color}18`,
            border: `1px solid ${color}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${color}20`,
          }}
          className="transition-transform group-hover:scale-110"
        >
          <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] border-t border-white/[0.04] pt-2.5 mt-auto">
        <span className="truncate">{description || "Real-time workspace telemetry"}</span>
        {trend && (
          <span
            style={{
              background: trend.direction === "up" ? "rgba(34,197,94,0.12)" : "rgba(99,102,241,0.12)",
              color: trend.direction === "up" ? "#22c55e" : "#818cf8",
              border: `1px solid ${trend.direction === "up" ? "rgba(34,197,94,0.25)" : "rgba(99,102,241,0.25)"}`,
              borderRadius: "6px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
