import * as React from "react";
import type { Metadata } from "next";

import { WorkspaceSettingsForm } from "@/features/settings/components/workspace-settings-form";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Workspace Settings",
  description: "Configure your workspace name, niche, language, and automation settings.",
};

export default function WorkspaceSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Manage your workspace name, content niche, language preferences, and automation configuration.
        </p>
      </div>

      <Separator />

      <WorkspaceSettingsForm />
    </div>
  );
}
