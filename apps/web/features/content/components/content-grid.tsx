"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, ExternalLink, Video, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { ContentStatusBadge } from "./content-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteContentMutation } from "../api/content-api";
import type { ContentDto } from "@repo/types";

interface ContentGridProps {
  items: ContentDto[];
  isLoading: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; isShorts: boolean; color: string }> = {
  "youtube-long": { label: "16:9 YouTube", isShorts: false, color: "#6366f1" },
  "youtube-short": { label: "9:16 Shorts", isShorts: true, color: "#f87171" },
  "facebook-video": { label: "16:9 FB Video", isShorts: false, color: "#3b82f6" },
  "facebook-reel": { label: "9:16 FB Reel", isShorts: true, color: "#ec4899" },
};

export function ContentGrid({ items, isLoading }: ContentGridProps) {
  const [deleteContent] = useDeleteContentMutation();

  async function handleDelete(e: React.MouseEvent, id: string, title: string) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteContent(id).unwrap();
      toast.success("Content item deleted");
    } catch {
      toast.error("Failed to delete content");
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
        <Video className="mx-auto h-12 w-12 text-[var(--muted-foreground)] opacity-40" />
        <h3 className="mt-3 text-base font-bold text-[var(--foreground)]">No content found</h3>
        <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
          No content matches your active filter criteria. Clear filters or create a new video pipeline item.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const typeInfo = TYPE_CONFIG[item.contentType] ?? {
          label: item.contentType,
          isShorts: false,
          color: "#818cf8",
        };

        return (
          <div
            key={item.id}
            className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            }}
          >
            <div>
              {/* Top row: Format Badge + Status + Dropdown */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md"
                    style={{
                      background: `${typeInfo.color}15`,
                      color: typeInfo.color,
                      border: `1px solid ${typeInfo.color}35`,
                    }}
                  >
                    {typeInfo.label}
                  </span>
                  <ContentStatusBadge status={item.status} />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[var(--sidebar-bg)] border-[var(--border)]">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/content/${item.id}`} className="gap-2 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Studio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(e, item.id, item.title)}
                      className="gap-2 text-xs text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Title & Description */}
              <Link href={`/dashboard/content/${item.id}`} className="block group-hover:text-indigo-400 transition-colors">
                <h3 className="font-bold text-sm text-[var(--foreground)] line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </Link>
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                {item.description || "No description provided for this content piece."}
              </p>
            </div>

            {/* Bottom Meta & Action Link */}
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="text-[11px]">
                {item.createdAt
                  ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                  : "Recently"}
              </span>

              <Link
                href={`/dashboard/content/${item.id}`}
                className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Edit Studio</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
