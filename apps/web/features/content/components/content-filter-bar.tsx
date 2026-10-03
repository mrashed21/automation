"use client";

import { LayoutGrid, List, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateContentDialog } from "./create-content-dialog";

interface ContentFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  contentType: string;
  onContentTypeChange: (val: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (val: "table" | "grid") => void;
}

export function ContentFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  contentType,
  onContentTypeChange,
  viewMode,
  onViewModeChange,
}: ContentFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search input */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            id="content-search-input"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="w-[140px]">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="filter-status" className="h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="researching">Researching</SelectItem>
              <SelectItem value="scripting">Scripting</SelectItem>
              <SelectItem value="rendering">Rendering</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Type filter */}
        <div className="w-[160px]">
          <Select value={contentType} onValueChange={onContentTypeChange}>
            <SelectTrigger id="filter-content-type" className="h-9 text-xs">
              <SelectValue placeholder="All Content Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="youtube-long">YouTube Long</SelectItem>
              <SelectItem value="youtube-short">YouTube Short</SelectItem>
              <SelectItem value="facebook-video">Facebook Video</SelectItem>
              <SelectItem value="facebook-reel">Facebook Reel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Mode Toggle & Create Action */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-0.5">
          <Button
            id="view-mode-table"
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("table")}
            className={`h-7 w-7 p-0 ${
              viewMode === "table"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            aria-label="Table view"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            id="view-mode-grid"
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={`h-7 w-7 p-0 ${
              viewMode === "grid"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
        </div>

        <CreateContentDialog />
      </div>
    </div>
  );
}
