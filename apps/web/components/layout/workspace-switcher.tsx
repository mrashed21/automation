"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentWorkspace } from "@/store/slices/auth-slice";
import { selectWorkspace } from "@/store/slices/workspace-slice";
import type { WorkspaceDto } from "@repo/types";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const dispatch = useAppDispatch();
  const { workspaces, selectedWorkspaceId } = useAppSelector((state) => state.workspace);
  const { currentWorkspace } = useAppSelector((state) => state.auth);

  const activeWorkspace =
    workspaces.find((w) => w.id === selectedWorkspaceId) ?? currentWorkspace ?? workspaces[0];

  function handleSelect(workspace: WorkspaceDto) {
    dispatch(selectWorkspace(workspace.id));
    dispatch(setCurrentWorkspace(workspace));
  }

  if (!activeWorkspace) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="workspace-switcher-trigger"
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
            "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
            "transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--sidebar-ring)]",
            collapsed && "justify-center px-0",
          )}
          aria-label="Switch workspace"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold uppercase">
            {activeWorkspace.name.charAt(0)}
          </span>
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{activeWorkspace.name}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => handleSelect(workspace)}
            className="gap-2"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--muted)] text-xs font-bold uppercase">
              {workspace.name.charAt(0)}
            </span>
            <span className="flex-1 truncate">{workspace.name}</span>
            {workspace.id === activeWorkspace.id && (
              <Check className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
            )}
          </DropdownMenuItem>
        ))}
        {workspaces.length === 0 && (
          <div className="px-2 py-4 text-center text-xs text-[var(--muted-foreground)]">
            <Building2 className="mx-auto mb-1 h-5 w-5 opacity-40" />
            No workspaces found
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
