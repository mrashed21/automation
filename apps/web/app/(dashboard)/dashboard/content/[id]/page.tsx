"use client";

import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetContentByIdQuery } from "@/features/content/api/content-api";
import { ContentDetailsTabs } from "@/features/content/components/content-details-tabs";
import { ContentStatusBadge } from "@/features/content/components/content-status-badge";

export default function ContentDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: content, isLoading, isError } = useGetContentByIdQuery(id || "", {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !content) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-[var(--destructive)]" />
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">Content Not Found</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The requested content piece does not exist or you do not have permission to view it.
          </p>
        </div>
        <Link href="/dashboard/content">
          <Button variant="outline" size="sm">Back to Content Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Breadcrumb */}
      <div className="space-y-2">
        <Link
          href="/dashboard/content"
          className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Content Library
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] truncate">
              {content.title}
            </h1>
            <ContentStatusBadge status={content.status} />
          </div>
        </div>
      </div>

      {/* 8-Tab Details Inspector */}
      <ContentDetailsTabs content={content} />
    </div>
  );
}
