"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MoreHorizontal, Trash2, Video } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { ContentDto } from "@repo/types";
import { useDeleteContentMutation } from "../api/content-api";
import { ContentStatusBadge } from "./content-status-badge";

interface ContentTableProps {
  items: ContentDto[];
  isLoading: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  "youtube-long": "YouTube Long",
  "youtube-short": "YouTube Short",
  "facebook-video": "FB Video",
  "facebook-reel": "FB Reel",
};

export function ContentTable({ items, isLoading }: ContentTableProps) {
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
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-[var(--border)]/40 last:border-0">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16 ml-auto" />
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Version</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60 text-[var(--foreground)]">
            {items.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-[var(--accent)]/40 group cursor-pointer"
              >
                <td className="py-3 px-4 font-medium max-w-xs sm:max-w-md truncate">
                  <Link
                    href={`/dashboard/content/${item.id}`}
                    className="hover:underline flex items-center gap-1.5"
                  >
                    <span className="truncate">{item.title}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                  {TYPE_LABELS[item.contentType] ?? item.contentType}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <ContentStatusBadge status={item.status} />
                </td>
                <td className="py-3 px-4 text-xs text-[var(--muted-foreground)]">
                  v{item.currentVersion ?? 1}
                </td>
                <td className="py-3 px-4 text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
