import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MetricCardProps {
  id: string;
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
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
  trend,
  className,
}: MetricCardProps) {
  const trendVariant =
    trend?.direction === "up"
      ? "success"
      : trend?.direction === "down"
        ? "destructive"
        : "secondary";

  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-[var(--card-foreground)]">
            {value}
          </p>
          {description && (
            <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
          )}
          {trend && (
            <Badge variant={trendVariant} className="mt-1 w-fit">
              {trend.label}
            </Badge>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
          <Icon className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
