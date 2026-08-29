"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  ShieldCheck,
  BookOpen,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetResearchByContentIdQuery,
  useGenerateResearchMutation,
  useUpdateFactStatusMutation,
  useVerifyAllFactsMutation,
} from "../api/research-api";
import type { ContentDto, FactVerificationStatus } from "@repo/types";

interface ResearchTabViewProps {
  content: ContentDto;
}

export function ResearchTabView({ content }: ResearchTabViewProps) {
  const { data: research, isLoading, error } = useGetResearchByContentIdQuery(content.id);
  const [generateResearch, { isLoading: isGenerating }] = useGenerateResearchMutation();
  const [updateFactStatus, { isLoading: isUpdatingFact }] = useUpdateFactStatusMutation();
  const [verifyAllFacts, { isLoading: isVerifyingAll }] = useVerifyAllFactsMutation();

  const [depth, setDepth] = React.useState<"standard" | "deep" | "fast">("standard");

  async function onTriggerResearch() {
    try {
      await generateResearch({
        contentId: content.id,
        input: { depth, niche: content.niche ?? undefined },
      }).unwrap();
      toast.success("Autonomous research and fact-checking complete!");
    } catch {
      toast.error("Failed to generate research for this topic.");
    }
  }

  async function onVerifyFact(factId: string, status: FactVerificationStatus) {
    try {
      await updateFactStatus({
        contentId: content.id,
        factId,
        input: { status, confidence: status === "verified" ? 95 : 50 },
      }).unwrap();
      toast.success(`Claim marked as ${status}`);
    } catch {
      toast.error("Failed to update claim verification status");
    }
  }

  async function onVerifyAll() {
    try {
      await verifyAllFacts(content.id).unwrap();
      toast.success("All claims verified successfully!");
    } catch {
      toast.error("Failed to batch verify claims");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading research dossier...</p>
      </div>
    );
  }

  if (!research || error) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <Search className="h-8 w-8" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Autonomous Research Agent</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Execute web search synthesis, extract verifiable factual claims, and attach authoritative citations to validate topic accuracy before script generation.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-1 text-xs">
            {(["fast", "standard", "deep"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepth(d)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                  depth === d
                    ? "bg-[var(--background)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <Button
            onClick={onTriggerResearch}
            disabled={isGenerating}
            className="gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Researching Web & Fact-Checking...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run Autonomous Research
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--foreground)]">{research.topic}</h3>
            <Badge
              variant={
                research.confidenceScore >= 85
                  ? "success"
                  : research.confidenceScore >= 60
                    ? "secondary"
                    : "destructive"
              }
              className="gap-1 font-semibold"
            >
              <ShieldCheck className="h-3 w-3" />
              {research.confidenceScore}% Confidence
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {research.keywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onVerifyAll}
            disabled={isVerifyingAll}
            className="gap-1.5 text-xs"
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            Verify All
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onTriggerResearch}
            disabled={isGenerating}
            className="gap-1.5 text-xs"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Re-run Research
          </Button>
        </div>
      </div>

      {/* Summary & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--foreground)] font-semibold text-sm">
            <BookOpen className="h-4 w-4 text-[var(--primary)]" />
            Executive Research Summary
          </div>
          <p className="text-sm text-[var(--foreground)]/90 leading-relaxed bg-[var(--muted)]/30 p-4 rounded-lg border border-[var(--border)]/60">
            {research.summary}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Strategic Insights for Scripting
            </div>
            <ul className="space-y-2">
              {research.keyInsights.map((insight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[var(--foreground)] bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sources column */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--foreground)] font-semibold text-sm">
              <ExternalLink className="h-4 w-4 text-[var(--primary)]" />
              Citations ({research.sources.length})
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">Reliability</span>
          </div>

          <div className="space-y-3">
            {research.sources.map((src) => (
              <div
                key={src.id}
                className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-3.5 space-y-2 transition-all hover:border-[var(--primary)]/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] line-clamp-2 transition-colors"
                  >
                    {src.title}
                  </a>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {src.reliabilityScore}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]/80">{src.publisher}</span>
                  <span className="capitalize">{src.sourceType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Claims Checklist */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Factual Claims Verification ({research.facts.length})
            </h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              All claims must be validated before audio recording and video rendering per plan.md section 24.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {research.facts.map((fact) => (
            <div
              key={fact.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      fact.status === "verified"
                        ? "success"
                        : fact.status === "disputed"
                          ? "destructive"
                          : fact.status === "rejected"
                            ? "destructive"
                            : "secondary"
                    }
                    className="capitalize text-[10px] py-0.5 px-2 font-semibold"
                  >
                    {fact.status === "verified" && <CheckCircle2 className="mr-1 h-3 w-3 inline" />}
                    {fact.status === "disputed" && <AlertCircle className="mr-1 h-3 w-3 inline" />}
                    {fact.status} ({fact.confidence}%)
                  </Badge>
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {fact.claim}
                  </span>
                </div>
                {fact.notes && (
                  <p className="text-xs text-[var(--muted-foreground)] pl-1">
                    ↳ {fact.notes}
                  </p>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant={fact.status === "verified" ? "default" : "outline"}
                  onClick={() => onVerifyFact(fact.id, "verified")}
                  disabled={isUpdatingFact}
                  className="h-7 text-xs px-2.5"
                >
                  Verify
                </Button>
                <Button
                  size="sm"
                  variant={fact.status === "disputed" ? "destructive" : "outline"}
                  onClick={() => onVerifyFact(fact.id, "disputed")}
                  disabled={isUpdatingFact}
                  className="h-7 text-xs px-2.5"
                >
                  Dispute
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
