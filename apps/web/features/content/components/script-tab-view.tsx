"use client";

import { format } from "date-fns";
import {
  Clock,
  Edit3,
  FileText,
  History,
  Loader2,
  Mic,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ContentDto,
  ScriptSectionDto,
} from "@repo/types";
import {
  useGenerateScriptMutation,
  useGetScriptByContentIdQuery,
  useGetScriptVersionsQuery,
  useUpdateScriptMutation,
} from "../api/script-api";

interface ScriptTabViewProps {
  content: ContentDto;
}

export function ScriptTabView({ content }: ScriptTabViewProps) {
  const { data: script, isLoading, error } = useGetScriptByContentIdQuery(content.id);
  const { data: versions } = useGetScriptVersionsQuery(content.id);
  const [generateScript, { isLoading: isGenerating }] = useGenerateScriptMutation();
  const [updateScript, { isLoading: isSaving }] = useUpdateScriptMutation();

  // Generator Options State
  const [tone, setTone] = React.useState<"informative" | "dramatic" | "energetic" | "casual" | "analytical">("informative");
  const [targetDuration, setTargetDuration] = React.useState<number>(
    content.contentType.includes("short") || content.contentType.includes("reel") ? 60 : 180,
  );
  const [customInstructions, setCustomInstructions] = React.useState("");

  // Editor State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableSections, setEditableSections] = React.useState<ScriptSectionDto[]>([]);
  const [editableHook, setEditableHook] = React.useState("");
  const [editableTitle, setEditableTitle] = React.useState("");
  const [changeReason, setChangeReason] = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);

  function handleStartEdit() {
    if (script) {
      setEditableSections(script.sections);
      setEditableHook(script.hook);
      setEditableTitle(script.title);
    }
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (script) {
      setEditableSections(script.sections);
      setEditableHook(script.hook);
      setEditableTitle(script.title);
    }
    setIsEditing(false);
  }

  async function onTriggerGenerate() {
    try {
      await generateScript({
        contentId: content.id,
        input: {
          tone,
          targetDurationSeconds: targetDuration,
          customInstructions: customInstructions || undefined,
        },
      }).unwrap();
      toast.success("AI Video Script generated and revision saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to generate script.");
    }
  }

  async function onSaveManualEdit() {
    if (!editableTitle.trim()) {
      toast.error("Script title cannot be empty");
      return;
    }

    try {
      await updateScript({
        contentId: content.id,
        input: {
          title: editableTitle,
          hook: editableHook,
          tone,
          sections: editableSections.map((s) => ({
            id: s.id,
            order: s.order,
            type: s.type,
            heading: s.heading,
            narration: s.narration,
            visualCue: s.visualCue,
            estimatedDurationSeconds: s.estimatedDurationSeconds,
          })),
          changeReason: changeReason || "Manual revisions saved via studio editor",
        },
      }).unwrap();
      toast.success("Script updated and new immutable version recorded!");
      setIsEditing(false);
      setChangeReason("");
    } catch {
      toast.error("Failed to update script");
    }
  }

  function handleSectionChange<K extends keyof ScriptSectionDto>(
    index: number,
    field: K,
    value: ScriptSectionDto[K],
  ) {
    const updated = [...editableSections];
    const target = { ...updated[index]!, [field]: value };
    if (field === "narration" && typeof value === "string") {
      const words = value.trim().split(/\s+/).filter(Boolean).length;
      target.wordCount = words;
      target.estimatedDurationSeconds = Math.max(2, Math.round(words / 2.4));
    }
    updated[index] = target;
    setEditableSections(updated);
  }

  function handleAddSection() {
    const newSec: ScriptSectionDto = {
      id: `temp-${Date.now()}`,
      order: editableSections.length + 1,
      type: "body",
      heading: `Section ${editableSections.length + 1}`,
      narration: "Enter narration script text here...",
      visualCue: "Enter visual cue for renderer here...",
      estimatedDurationSeconds: 10,
      wordCount: 20,
    };
    setEditableSections([...editableSections, newSec]);
  }

  function handleRemoveSection(index: number) {
    if (editableSections.length <= 1) {
      toast.error("Script must contain at least one section");
      return;
    }
    const updated = editableSections.filter((_, i) => i !== index);
    setEditableSections(updated.map((sec, i) => ({ ...sec, order: i + 1 })));
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading script narrative...</p>
      </div>
    );
  }

  if (!script || error) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[var(--foreground)]">AI Script Generator</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Generate high-retention video scripts formatted into hooks, sequential storyline beats, pacing timestamps, and visual prompts for video composition.
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-[var(--muted)]/20 p-5 rounded-xl border border-[var(--border)] space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Script Tone</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(["informative", "dramatic", "energetic", "casual", "analytical"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1.5 rounded-lg capitalize text-xs font-medium border text-center transition-all ${
                    tone === t
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                      : "bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Target Length</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 120, 300].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTargetDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    targetDuration === d
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                      : "bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {d < 60 ? `${d}s Short` : `${d / 60}m Video`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Custom Script Directives (Optional)</label>
            <Input
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. emphasize recent 2026 benchmarks, use intense metaphors..."
              className="text-xs"
            />
          </div>
        </div>

        <Button
          onClick={onTriggerGenerate}
          disabled={isGenerating}
          className="gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Crafting Narrative Script...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Script with AI
            </>
          )}
        </Button>
      </div>
    );
  }

  const displaySections = isEditing ? editableSections : script.sections;
  const displayTitle = isEditing ? editableTitle : script.title;
  const displayHook = isEditing ? editableHook : script.hook;

  const totalWords = displaySections.reduce((acc, s) => acc + (s.wordCount || 0), 0);
  const totalSeconds = displaySections.reduce((acc, s) => acc + (s.estimatedDurationSeconds || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                className="text-base font-bold h-8 max-w-md"
              />
            ) : (
              <h3 className="text-base font-bold text-[var(--foreground)]">{displayTitle}</h3>
            )}
            <Badge variant="outline" className="font-semibold text-xs shrink-0">
              v{script.currentVersion}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1 font-medium text-[var(--foreground)]">
              <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
              ~{Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {totalWords} words
            </span>
            <span>•</span>
            <span className="capitalize font-medium text-[var(--foreground)]">{script.tone} tone</span>
            <span>•</span>
            <span>{displaySections.length} sections</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-1.5 text-xs"
          >
            <History className="h-3.5 w-3.5" />
            Revisions ({versions?.length || 1})
          </Button>

          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSaveManualEdit}
                disabled={isSaving}
                className="gap-1.5 text-xs bg-[var(--primary)] text-[var(--primary-foreground)]"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save & New Version
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
                className="gap-1.5 text-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Script
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onTriggerGenerate}
                disabled={isGenerating}
                className="gap-1.5 text-xs"
              >
                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Regenerate AI
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Version History Drawer Panel */}
      {showHistory && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <History className="h-4 w-4 text-[var(--primary)]" />
              Immutable Script Revision History
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="text-xs h-7">
              Close
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {versions?.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--foreground)]">Version {v.version}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {v.provider} / {v.model}
                    </Badge>
                  </div>
                  <p className="text-[var(--muted-foreground)]">{v.changeReason}</p>
                </div>
                <div className="text-right text-[var(--muted-foreground)]">
                  <div>{v.wordCount} words</div>
                  <div className="text-[10px]">{format(new Date(v.createdAt), "MMM d, HH:mm")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hook Highlight */}
      <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Opening 3-Second Scroll-Stopping Hook
          </span>
          <Badge variant="outline" className="text-[10px]">Critical Retention Zone</Badge>
        </div>
        {isEditing ? (
          <Input
            value={editableHook}
            onChange={(e) => setEditableHook(e.target.value)}
            className="text-sm font-semibold bg-[var(--background)]"
          />
        ) : (
          <p className="text-sm font-semibold text-[var(--foreground)] leading-relaxed italic">
            &ldquo;{displayHook}&rdquo;
          </p>
        )}
      </div>

      {/* Sections Breakdown Studio */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[var(--foreground)]">
            Script Sections & Visual Directives
          </h4>
          {isEditing && (
            <Button size="sm" variant="outline" onClick={handleAddSection} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {displaySections.map((section, idx) => (
            <div
              key={section.id || idx}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 shadow-2xs"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--muted)] text-[var(--foreground)] font-bold text-xs">
                    {section.order}
                  </span>
                  {isEditing ? (
                    <Input
                      value={section.heading}
                      onChange={(e) => handleSectionChange(idx, "heading", e.target.value)}
                      className="h-7 text-xs font-semibold max-w-xs"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {section.heading}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                    {section.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted-foreground)] font-medium">
                    {section.estimatedDurationSeconds}s ({section.wordCount} words)
                  </span>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveSection(idx)}
                      className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Section Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Spoken Narration */}
                <div className="md:col-span-7 space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-[var(--primary)]" />
                    Spoken Voiceover Narration
                  </label>
                  {isEditing ? (
                    <textarea
                      value={section.narration}
                      onChange={(e) => handleSectionChange(idx, "narration", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] leading-relaxed">
                      {section.narration}
                    </div>
                  )}
                </div>

                {/* Visual Cue for Media Engine */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-blue-500" />
                    Video Renderer Visual Cue
                  </label>
                  {isEditing ? (
                    <textarea
                      value={section.visualCue}
                      onChange={(e) => handleSectionChange(idx, "visualCue", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-[var(--muted)]/30 border border-[var(--border)]/60 text-xs text-[var(--muted-foreground)] leading-relaxed italic">
                      {section.visualCue || "No visual directive specified."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
