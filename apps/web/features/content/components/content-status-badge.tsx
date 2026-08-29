import * as React from "react";
import type { ContentStatus } from "@repo/types";
import { Badge } from "@/components/ui/badge";

interface ContentStatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  ContentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  researching: { label: "Researching", variant: "info" },
  scripting: { label: "Scripting", variant: "info" },
  "fact-checking": { label: "Fact Checking", variant: "warning" },
  "media-sourcing": { label: "Media Sourcing", variant: "info" },
  "voice-generating": { label: "Voice Gen", variant: "info" },
  rendering: { label: "Rendering", variant: "warning" },
  "quality-check": { label: "Quality Check", variant: "warning" },
  "compliance-check": { label: "Compliance Check", variant: "warning" },
  ready: { label: "Ready", variant: "success" },
  scheduled: { label: "Scheduled", variant: "info" },
  publishing: { label: "Publishing", variant: "warning" },
  published: { label: "Published", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  archived: { label: "Archived", variant: "outline" },
};

export function ContentStatusBadge({ status, className }: ContentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "secondary" };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
