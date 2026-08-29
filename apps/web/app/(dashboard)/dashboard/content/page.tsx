"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useAppSelector } from "@/store/hooks";
import { useGetContentsQuery } from "@/features/content/api/content-api";
import { ContentFilterBar } from "@/features/content/components/content-filter-bar";
import { ContentTable } from "@/features/content/components/content-table";
import { ContentGrid } from "@/features/content/components/content-grid";
import { Button } from "@/components/ui/button";

export default function ContentLibraryPage() {
  const { currentWorkspace } = useAppSelector((state) => state.auth);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [contentType, setContentType] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [page, setPage] = React.useState(1);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useGetContentsQuery(
    {
      workspaceId: currentWorkspace?.id,
      page,
      limit: 12,
      status: status !== "all" ? status : undefined,
      contentType: contentType !== "all" ? contentType : undefined,
      search: debouncedSearch || undefined,
    },
    { skip: !currentWorkspace?.id },
  );

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Content Library
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Manage, track, and automate all content assets in your pipeline.
        </p>
      </div>

      {/* Filter Bar */}
      <ContentFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        contentType={contentType}
        onContentTypeChange={(val) => {
          setContentType(val);
          setPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content View */}
      {viewMode === "table" ? (
        <ContentTable items={items} isLoading={isLoading} />
      ) : (
        <ContentGrid items={items} isLoading={isLoading} />
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            Showing <span className="font-medium">{items.length}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> items
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPreviousPage || isLoading}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs text-[var(--muted-foreground)] px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="h-8 gap-1 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
