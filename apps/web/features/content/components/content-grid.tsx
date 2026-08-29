"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, ExternalLink, Video, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ContentStatusBadge } from "./content-status-badge";
import { Badge } from "@/components/ui/badge";
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

const TYPE_LABELS: Record<string, string> = {
  "youtube-long": "YouTube Long",
  "youtube-short": "YouTube Short",
  "facebook-video": "FB Video",
  "facebook-reel": "FB Reel",
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
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/40 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
          <Video className="h-6 w-6 text-[var(--muted-foreground)]" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">No content found</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)] max-w-sm">
          Get started by creating your first content piece or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs transition-all hover:shadow-md hover:border-[var(--ring)]/40"
        >
          <div>
            {/* Top row: Badges + Action dropdown */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <ContentStatusBadge status={item.status} />
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {TYPE_LABELS[item.contentType] ?? item.contentType}
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/content/${item.id}`} className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => handleDelete(e, item.id, item.title)}
                    className="gap-2 text-[var(--destructive)] focus:text-[var(--destructive)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            <h4 className="mt-3 text-base font-semibold leading-snug text-[var(--card-foreground)] group-hover:text-[var(--primary)] transition-colors">
              <Link href={`/dashboard/content/${item.id}`} className="line-clamp-2">
                {item.title}
              </Link>
            </h4>

            {/* Description / Niche */}
            {item.description ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)] line-clamp-2">
                {item.description}
              </p>
            ) : item.niche ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[var(--primary)]" />
                <span>Niche: {item.niche}</span>
              </p>
            ) : null}
          </div>

          {/* Footer: Version and Time */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)]/60 pt-3 text-[11px] text-[var(--muted-foreground)]">
            <span className="font-mono">v{item.currentVersion ?? 1}</span>
            <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
