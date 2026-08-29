"use client";

import * as React from "react";
import { Menu, Moon, Sun, Monitor, Bell, Search, Sparkles } from "lucide-react";

import { UserMenu } from "@/components/layout/user-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, setTheme } from "@/store/slices/ui-slice";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export function DashboardHeader() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);

  return (
    <header className="dashboard-header justify-between">
      {/* Left side: Sidebar toggle + Global Search Mock */}
      <div className="flex items-center gap-3">
        <button
          id="header-sidebar-toggle"
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)]",
            "hover:bg-white/[0.06] hover:text-[var(--foreground)]",
            "transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/[0.04] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] w-64 hover:border-indigo-500/40 transition-colors cursor-pointer">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search content, rules, jobs...</span>
          <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] border border-white/[0.06]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: AI Status pill + Notifications + Theme + User */}
      <div className="flex items-center gap-3">
        {/* Autonomous Engine Live Status Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-xs text-emerald-400 font-semibold shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Sparkles className="h-3 w-3" />
          <span>Autonomous Loop Active</span>
        </div>

        {/* Notifications Icon */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-white/[0.06] hover:text-[var(--foreground)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[var(--header-bg)]" />
        </button>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="theme-toggle"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)]",
                "hover:bg-white/[0.06] hover:text-[var(--foreground)]",
                "transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
              )}
              aria-label="Toggle theme"
            >
              {theme === "light" && <Sun className="h-4 w-4" aria-hidden="true" />}
              {theme === "dark" && <Moon className="h-4 w-4" aria-hidden="true" />}
              {theme === "system" && <Monitor className="h-4 w-4" aria-hidden="true" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="bg-[var(--sidebar-bg)] border-[var(--border)]">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                onSelect={() => dispatch(setTheme(value))}
                className={cn("gap-2 text-xs", theme === value && "font-bold text-indigo-400 bg-indigo-500/10")}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-[1px] bg-[var(--border)] mx-1" />

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
