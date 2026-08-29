"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Radio,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/ui-slice";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Content Library", href: "/dashboard/content", icon: FileText },
    ],
  },
  {
    label: "Publishing",
    items: [
      { label: "Publishing", href: "/dashboard/publishing", icon: Radio },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Automation", href: "/dashboard/automation", icon: Zap },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Settings", href: "/dashboard/settings/workspace", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn("sidebar flex flex-col", collapsed && "collapsed")}
        aria-label="Main navigation"
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex h-[var(--header-height)] shrink-0 items-center border-b border-[var(--sidebar-border)] px-3",
            collapsed ? "justify-center" : "gap-2",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm text-[var(--sidebar-foreground)] truncate">
              AI Content Platform
            </span>
          )}
        </div>

        {/* Workspace Switcher */}
        <div
          className={cn(
            "shrink-0 border-b border-[var(--sidebar-border)] px-2 py-2",
          )}
        >
          <WorkspaceSwitcher collapsed={collapsed} />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {navSections.map((section, sectionIndex) => (
            <React.Fragment key={section.label}>
              {sectionIndex > 0 && (
                <Separator className="my-1 bg-[var(--sidebar-border)]" />
              )}
              {!collapsed && (
                <p className="mb-1 mt-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-foreground)]/50">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    key={item.href}
                    id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                      "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
                      "focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--sidebar-ring)]",
                      active &&
                        "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold",
                      collapsed && "justify-center px-0 w-10 mx-auto",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "opacity-100" : "opacity-70",
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="shrink-0 border-t border-[var(--sidebar-border)] p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                id="sidebar-collapse-toggle"
                onClick={() => dispatch(toggleSidebar())}
                className={cn(
                  "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-[var(--sidebar-foreground)]/60",
                  "hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
                  "transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--sidebar-ring)]",
                  collapsed && "justify-center px-0",
                )}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <>
                    <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">Collapse</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
