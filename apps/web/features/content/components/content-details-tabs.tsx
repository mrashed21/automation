"use client";

import * as React from "react";
import { formatDistanceToNow, format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FileText,
  History,
  Sparkles,
  Video,
  Image as ImageIcon,
  Send,
  BarChart3,
  CheckCircle2,
  Save,
  Clock,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentStatusBadge } from "./content-status-badge";
import {
  useUpdateContentMutation,
  useGetContentVersionsQuery,
} from "../api/content-api";
import { updateContentSchema, type UpdateContentInput } from "@repo/validation";
import type { ContentDto } from "@repo/types";

interface ContentDetailsTabsProps {
  content: ContentDto;
}

export function ContentDetailsTabs({ content }: ContentDetailsTabsProps) {
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const { data: versions, isLoading: isLoadingVersions } = useGetContentVersionsQuery(content.id);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<UpdateContentInput>({
    resolver: zodResolver(updateContentSchema),
    defaultValues: {
      title: content.title,
      description: content.description || "",
      niche: content.niche || "",
      language: content.language || "en",
    },
  });

  // Sync form default values if content changes externally
  React.useEffect(() => {
    reset({
      title: content.title,
      description: content.description || "",
      niche: content.niche || "",
      language: content.language || "en",
    });
  }, [content, reset]);

  async function onSaveOverview(data: UpdateContentInput) {
    try {
      await updateContent({
        id: content.id,
        ...data,
        changeReason: "Updated via details editor",
      }).unwrap();
      toast.success("Content saved and new version recorded!");
    } catch {
      toast.error("Failed to update content item");
    }
  }

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-[var(--muted)]/60 p-1">
        <TabsTrigger value="overview" className="gap-1.5 text-xs py-1.5 px-3">
          <FileText className="h-3.5 w-3.5" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="script" className="gap-1.5 text-xs py-1.5 px-3">
          <Sparkles className="h-3.5 w-3.5" />
          Script
        </TabsTrigger>
        <TabsTrigger value="research" className="gap-1.5 text-xs py-1.5 px-3">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Research & Facts
        </TabsTrigger>
        <TabsTrigger value="media" className="gap-1.5 text-xs py-1.5 px-3">
          <Video className="h-3.5 w-3.5" />
          Media & Video
        </TabsTrigger>
        <TabsTrigger value="thumbnail" className="gap-1.5 text-xs py-1.5 px-3">
          <ImageIcon className="h-3.5 w-3.5" />
          Thumbnail
        </TabsTrigger>
        <TabsTrigger value="publishing" className="gap-1.5 text-xs py-1.5 px-3">
          <Send className="h-3.5 w-3.5" />
          Publishing
        </TabsTrigger>
        <TabsTrigger value="analytics" className="gap-1.5 text-xs py-1.5 px-3">
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="versions" className="gap-1.5 text-xs py-1.5 px-3">
          <History className="h-3.5 w-3.5" />
          Versions ({versions?.length ?? content.currentVersion ?? 1})
        </TabsTrigger>
      </TabsList>

      {/* 1. OVERVIEW TAB */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main edit form */}
          <div className="lg:col-span-2 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="text-base font-semibold text-[var(--foreground)]">Content Information</h3>
            <form onSubmit={handleSubmit(onSaveOverview)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" {...register("title")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-niche">Niche</Label>
                  <Input id="edit-niche" {...register("niche")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-language">Language</Label>
                  <Input id="edit-language" {...register("language")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description">Description / Notes</Label>
                <textarea
                  id="edit-description"
                  rows={4}
                  className="flex w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
                  {...register("description")}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  id="btn-save-content-overview"
                  type="submit"
                  disabled={!isDirty || isUpdating}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar metadata card */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Status & Quality
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Current Status</span>
                <ContentStatusBadge status={content.status} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Version</span>
                <Badge variant="outline">v{content.currentVersion ?? 1}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Compliance</span>
                <Badge
                  variant={
                    content.complianceStatus === "approved"
                      ? "success"
                      : content.complianceStatus === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {content.complianceStatus}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Quality Score</span>
                <span className="text-sm font-semibold">
                  {content.qualityScore !== null ? `${content.qualityScore}%` : "Pending"}
                </span>
              </div>

              <Separator />

              <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{format(new Date(content.createdAt), "MMM d, yyyy HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}</span>
                </div>
                {content.scheduledAt && (
                  <div className="flex justify-between text-[var(--primary)] font-medium">
                    <span>Scheduled for</span>
                    <span>{format(new Date(content.scheduledAt), "MMM d, yyyy HH:mm")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* 2. SCRIPT TAB */}
      <TabsContent value="script" className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Generated Script</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                AI scripted narrative with timestamps, hooks, and call-to-actions.
              </p>
            </div>
            <Badge variant="secondary">Phase 05 Feature</Badge>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center bg-[var(--muted)]/20">
            <Sparkles className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Script generation engine will be active in Phase 05.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* 3. RESEARCH & FACTS TAB */}
      <TabsContent value="research" className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Research & Verified Facts</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Sources, web search findings, and fact-checking verification scores.
              </p>
            </div>
            <Badge variant="secondary">Phase 04 Feature</Badge>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center bg-[var(--muted)]/20">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Autonomous Research Agent will populate verified facts in Phase 04.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* 4. MEDIA & VIDEO TAB */}
      <TabsContent value="media" className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Video Asset & Render Output</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Audio narration, background music, video cuts, and rendered MP4 files.
              </p>
            </div>
            <Badge variant="secondary">Phase 06/07 Feature</Badge>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center bg-[var(--muted)]/20">
            <Video className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              FFmpeg Media Worker render pipeline will connect in Phase 06 & 07.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* 5. THUMBNAIL TAB */}
      <TabsContent value="thumbnail" className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Thumbnail Previews</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                High-CTR thumbnail variants generated via AI Image providers.
              </p>
            </div>
            <Badge variant="secondary">Phase 06 Feature</Badge>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center bg-[var(--muted)]/20">
            <ImageIcon className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Thumbnail generator will preview and A/B test variations in Phase 06.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* 6. PUBLISHING TAB */}
      <TabsContent value="publishing" className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Publishing & Scheduling</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Target YouTube and Facebook channels, tags, categories, and calendar schedule.
              </p>
            </div>
            <Badge variant="secondary">Phase 08 Feature</Badge>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center bg-[var(--muted)]/20">
            <Send className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Social publishing adapters (YouTube & Meta) connect in Phase 08.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* 7. ANALYTICS TAB */}
      <TabsContent value="analytics" className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Performance Analytics</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Views, watch time, retention curves, click-through rate, and engagement.
              </p>
            </div>
            <Badge variant="secondary">Phase 11 Feature</Badge>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center bg-[var(--muted)]/20">
            <BarChart3 className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Live analytics sync from YouTube/Facebook APIs will activate in Phase 11.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* 8. VERSION HISTORY TAB */}
      <TabsContent value="versions" className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Immutable Version History</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Every content modification creates an immutable snapshot for auditability and rollback.
            </p>
          </div>

          {isLoadingVersions ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-[var(--muted)]/50 animate-pulse" />
              ))}
            </div>
          ) : !versions || versions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-foreground)]">
              No previous versions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="flex items-start justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-4 transition-colors hover:bg-[var(--accent)]/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={ver.version === content.currentVersion ? "default" : "secondary"}>
                        v{ver.version} {ver.version === content.currentVersion ? "(Current)" : ""}
                      </Badge>
                      <h4 className="text-sm font-medium text-[var(--foreground)]">{ver.title}</h4>
                    </div>
                    {ver.description && (
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                        {ver.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                      <span className="font-medium text-[var(--primary)]">{ver.changeReason}</span>
                      <span>•</span>
                      <span>Source: {ver.source}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDistanceToNow(new Date(ver.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
