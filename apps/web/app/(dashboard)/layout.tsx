import * as React from "react";

import { DashboardContentWrapper } from "@/components/layout/dashboard-content-wrapper";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { AuthGuard } from "@/features/auth/components/auth-guard";

/**
 * Dashboard shell layout — wraps all authenticated pages.
 *
 * Rendered structure:
 *   <AuthGuard>          — redirects to /login if unauthenticated
 *     <div.sidebar-shell>
 *       <aside.sidebar>  — collapsible sidebar (DashboardSidebar)
 *       <div.content>    — DashboardContentWrapper (client, reads Redux)
 *         <header>       — sticky header (DashboardHeader)
 *         <main>         — page content via {children}
 *       </div>
 *     </div>
 *   </AuthGuard>
 *
 * The sidebar collapsed state is managed in the Redux ui slice and applied
 * via CSS custom properties (--sidebar-width / --sidebar-collapsed-width).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="sidebar-shell">
        <DashboardSidebar />
        <DashboardContentWrapper>
          <DashboardHeader />
          <main className="dashboard-main">{children}</main>
        </DashboardContentWrapper>
      </div>
    </AuthGuard>
  );
}
