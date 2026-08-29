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
  Target,
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
    label: "Content Engine",
    items: [
      { label: "Content Library", href: "/dashboard/content", icon: FileText },
      { label: "Publishing Hub", href: "/dashboard/publishing", icon: Radio },
    ],
  },
  {
    label: "Autonomous AI",
    items: [
      { label: "AI Strategist", href: "/dashboard/strategy", icon: Target },
      { label: "Automation Engine", href: "/dashboard/automation", icon: Zap },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics Studio", href: "/dashboard/analytics", icon: BarChart3 },
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
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn("sidebar flex flex-col", collapsed && "collapsed")}
        aria-label="Main navigation"
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex h-[var(--header-height)] shrink-0 items-center border-b border-[var(--sidebar-border)] px-4",
            collapsed ? "justify-center px-0" : "gap-3",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-[var(--foreground)] truncate">
                AI Operations
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                Enterprise Studio
              </span>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        <div
          className={cn(
            "shrink-0 border-b border-[var(--sidebar-border)] px-3 py-2.5",
          )}
        >
          <WorkspaceSwitcher collapsed={collapsed} />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-3.5">
          {navSections.map((section, sectionIndex) => (
            <React.Fragment key={section.label}>
              {sectionIndex > 0 && (
                <Separator className="my-2 bg-[var(--sidebar-border)]/60" />
              )}
              {!collapsed && (
                <p className="mb-1.5 mt-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
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
                      "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-gradient-to-r from-indigo-500/15 via-indigo-500/8 to-transparent text-indigo-400 font-semibold shadow-sm"
                        : "text-[var(--sidebar-foreground)] hover:bg-white/[0.04] hover:text-[var(--foreground)]",
                      "focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--sidebar-ring)]",
                      collapsed && "justify-center px-0 w-10 mx-auto",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-500 shadow-sm shadow-indigo-500" />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                        active ? "text-indigo-400" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]",
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
                      <TooltipContent side="right" className="font-semibold text-xs">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="shrink-0 border-t border-[var(--sidebar-border)] p-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                id="sidebar-collapse-toggle"
                onClick={() => dispatch(toggleSidebar())}
                className={cn(
                  "flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium text-[var(--muted-foreground)]",
                  "hover:bg-white/[0.04] hover:text-[var(--foreground)]",
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
                    <span>Collapse Sidebar</span>
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
