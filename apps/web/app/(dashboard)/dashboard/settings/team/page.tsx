import * as React from "react";
import type { Metadata } from "next";

import { TeamMembersTable } from "@/features/settings/components/team-members-table";
import { InviteMemberForm } from "@/features/settings/components/invite-member-form";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Team Members",
  description: "Manage workspace team members, roles, and invitations.",
};

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Team Members
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Manage who has access to this workspace and what they can do.
        </p>
      </div>

      <Separator />

      {/* Invite form */}
      <section aria-labelledby="invite-section-heading">
        <h2 id="invite-section-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Invite a Member
        </h2>
        <InviteMemberForm />
      </section>

      <Separator />

      {/* Members table */}
      <section aria-labelledby="members-section-heading">
        <h2 id="members-section-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Current Members
        </h2>
        <TeamMembersTable />
      </section>
    </div>
  );
}
