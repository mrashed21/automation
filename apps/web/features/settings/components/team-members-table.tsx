"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector } from "@/store/hooks";
import {
  useGetWorkspaceMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from "@/features/workspaces/api/workspace-api";
import type { WorkspaceMemberDto, WorkspaceMemberRole } from "@repo/types";
import type { UpdateMemberRoleInput } from "@repo/validation";

const ROLE_BADGE_VARIANT: Record<WorkspaceMemberRole, "default" | "secondary" | "outline" | "warning"> = {
  owner: "default",
  admin: "warning",
  editor: "secondary",
  viewer: "outline",
};

const UPDATABLE_ROLES = ["admin", "editor", "viewer"] as const;

export function TeamMembersTable() {
  const { currentWorkspace, user: currentUser } = useAppSelector((state) => state.auth);
  const workspaceId = currentWorkspace?.id ?? "";

  const { data: members, isLoading, isError } = useGetWorkspaceMembersQuery(workspaceId, {
    skip: !workspaceId,
  });

  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  async function handleRoleChange(member: WorkspaceMemberDto, newRole: string) {
    try {
      await updateRole({
        workspaceId,
        userId: member.userId,
        role: newRole as UpdateMemberRoleInput["role"],
      }).unwrap();
      toast.success(`${member.user.name}'s role updated to ${newRole}.`);
    } catch {
      toast.error("Failed to update role. Please try again.");
    }
  }

  async function handleRemove(member: WorkspaceMemberDto) {
    try {
      await removeMember({ workspaceId, userId: member.userId }).unwrap();
      toast.success(`${member.user.name} removed from workspace.`);
    } catch {
      toast.error("Failed to remove member. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--destructive)]">
        Failed to load team members. Please refresh the page.
      </p>
    );
  }

  if (!members || members.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        No team members found. Invite someone to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const initials = member.user.name
          .split(" ")
          .map((p) => p.charAt(0))
          .slice(0, 2)
          .join("")
          .toUpperCase();

        const isSelf = member.userId === currentUser?.id;
        const isOwner = member.role === "owner";
        const canModify = !isSelf && !isOwner;

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--card-foreground)]">
                {member.user.name}
                {isSelf && (
                  <span className="ml-1.5 text-xs text-[var(--muted-foreground)]">(you)</span>
                )}
              </p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{member.user.email}</p>
            </div>

            {canModify ? (
              <Select
                value={member.role}
                onValueChange={(val) => handleRoleChange(member, val)}
              >
                <SelectTrigger
                  id={`role-select-${member.id}`}
                  className="h-7 w-28 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPDATABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="text-xs">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={ROLE_BADGE_VARIANT[member.role]}>
                {member.role}
              </Badge>
            )}

            {canModify && (
              <Button
                id={`remove-member-${member.id}`}
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(member)}
                className="h-7 w-7 p-0 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                aria-label={`Remove ${member.user.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
