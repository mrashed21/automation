"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { useAppSelector } from "@/store/hooks";

export function UserMenu() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutMutation, { isLoading }] = useLogoutMutation();

  async function handleLogout() {
    await logoutMutation();
    router.push("/login");
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="user-menu-trigger"
          className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-[var(--accent)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
          aria-label="Open user menu"
        >
          <Avatar className="h-7 w-7">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-xs leading-none text-[var(--muted-foreground)] truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => router.push("/dashboard/settings/workspace")}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Workspace Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => router.push("/dashboard/settings/team")}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          Team Members
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          id="logout-button"
          onSelect={handleLogout}
          disabled={isLoading}
          className="gap-2 text-[var(--destructive)] focus:text-[var(--destructive)]"
        >
          <LogOut className="h-4 w-4" />
          {isLoading ? "Signing out…" : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
