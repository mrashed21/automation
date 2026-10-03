"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInviteMemberMutation } from "@/features/workspaces/api/workspace-api";
import { useAppSelector } from "@/store/hooks";
import { inviteMemberSchema, type InviteMemberInput } from "@repo/validation";

export function InviteMemberForm() {
  const { currentWorkspace } = useAppSelector((state) => state.auth);
  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "editor" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: InviteMemberInput) {
    if (!currentWorkspace) return;
    try {
      await inviteMember({ workspaceId: currentWorkspace.id, ...data }).unwrap();
      toast.success(`Invitation sent to ${data.email}.`);
      reset();
    } catch {
      toast.error("Failed to send invitation. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="invite-email">Email address</Label>
        <Input
          id="invite-email"
          type="email"
          placeholder="colleague@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-[var(--destructive)]">{errors.email.message}</p>
        )}
      </div>

      <div className="w-full sm:w-36 space-y-1.5">
        <Label htmlFor="invite-role">Role</Label>
        <Select
          value={selectedRole}
          onValueChange={(val) =>
            setValue("role", val as InviteMemberInput["role"], { shouldDirty: true })
          }
        >
          <SelectTrigger id="invite-role">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button id="invite-member-submit" type="submit" disabled={isLoading} className="gap-2 shrink-0">
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        {isLoading ? "Sending…" : "Send Invite"}
      </Button>
    </form>
  );
}
