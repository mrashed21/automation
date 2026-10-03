"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUpdateWorkspaceMutation } from "@/features/workspaces/api/workspace-api";
import { useAppSelector } from "@/store/hooks";
import { updateWorkspaceSchema, type UpdateWorkspaceInput } from "@repo/validation";

export function WorkspaceSettingsForm() {
  const { currentWorkspace } = useAppSelector((state) => state.auth);
  const [updateWorkspace, { isLoading }] = useUpdateWorkspaceMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: currentWorkspace?.name ?? "",
      niche: currentWorkspace?.niche ?? "",
      language: currentWorkspace?.language ?? "en",
      dailyContentTarget: currentWorkspace?.dailyContentTarget ?? 1,
      isAutomationEnabled: currentWorkspace?.isAutomationEnabled ?? false,
      automationMode: currentWorkspace?.automationMode ?? "approval-required",
    },
  });

  const automationMode = watch("automationMode");
  const isAutomationEnabled = watch("isAutomationEnabled");

  async function onSubmit(data: UpdateWorkspaceInput) {
    if (!currentWorkspace) return;
    try {
      await updateWorkspace({ id: currentWorkspace.id, ...data }).unwrap();
      toast.success("Workspace settings saved.");
    } catch {
      toast.error("Failed to save workspace settings. Please try again.");
    }
  }

  if (!currentWorkspace) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">No active workspace selected.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg" noValidate>
      {/* Basic information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Basic Information</h3>
        <div className="space-y-1.5">
          <Label htmlFor="ws-name">Workspace Name</Label>
          <Input
            id="ws-name"
            placeholder="My Workspace"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ws-niche">Niche / Topic</Label>
          <Input
            id="ws-niche"
            placeholder="e.g. Technology, Finance, Health…"
            {...register("niche")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ws-language">Language</Label>
          <Input
            id="ws-language"
            placeholder="en"
            maxLength={10}
            {...register("language")}
            aria-invalid={!!errors.language}
          />
          {errors.language && (
            <p className="text-xs text-[var(--destructive)]">{errors.language.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ws-daily-target">Daily Content Target</Label>
          <Input
            id="ws-daily-target"
            type="number"
            min={1}
            max={20}
            {...register("dailyContentTarget", { valueAsNumber: true })}
            aria-invalid={!!errors.dailyContentTarget}
          />
          {errors.dailyContentTarget && (
            <p className="text-xs text-[var(--destructive)]">
              {errors.dailyContentTarget.message}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Automation settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Automation</h3>

        <div className="flex items-center gap-3">
          <input
            id="ws-automation-enabled"
            type="checkbox"
            className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
            {...register("isAutomationEnabled")}
            checked={isAutomationEnabled ?? false}
            onChange={(e) => setValue("isAutomationEnabled", e.target.checked, { shouldDirty: true })}
          />
          <Label htmlFor="ws-automation-enabled" className="cursor-pointer">
            Enable content automation
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ws-automation-mode">Automation Mode</Label>
          <Select
            value={automationMode ?? "approval-required"}
            onValueChange={(val) =>
              setValue(
                "automationMode",
                val as "full-auto" | "approval-required" | "hybrid",
                { shouldDirty: true },
              )
            }
          >
            <SelectTrigger id="ws-automation-mode">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-auto">Full Auto</SelectItem>
              <SelectItem value="approval-required">Approval Required</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[var(--muted-foreground)]">
            {automationMode === "full-auto" &&
              "Content is researched, produced, and published without manual review."}
            {automationMode === "approval-required" &&
              "Every content item requires your approval before publishing."}
            {automationMode === "hybrid" &&
              "Low-risk content publishes automatically; flagged items require approval."}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          id="ws-settings-save"
          type="submit"
          disabled={isLoading || !isDirty}
        >
          {isLoading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
