"use client";

import * as React from "react";
import { Menu, Moon, Sun, Monitor } from "lucide-react";

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
    <header className="dashboard-header">
      {/* Sidebar toggle */}
      <button
        id="header-sidebar-toggle"
        onClick={() => dispatch(toggleSidebar())}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground)]/60",
          "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
          "transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
        )}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id="theme-toggle"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground)]/60",
              "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
              "transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
            )}
            aria-label="Toggle theme"
          >
            {theme === "light" && <Sun className="h-4 w-4" aria-hidden="true" />}
            {theme === "dark" && <Moon className="h-4 w-4" aria-hidden="true" />}
            {theme === "system" && <Monitor className="h-4 w-4" aria-hidden="true" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuItem
              key={value}
              onSelect={() => dispatch(setTheme(value))}
              className={cn("gap-2", theme === value && "font-semibold")}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <UserMenu />
    </header>
  );
}
