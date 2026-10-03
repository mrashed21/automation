import Link from "next/link";
import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 shadow-md dark:bg-zinc-50 dark:text-zinc-900 font-bold text-lg">
              AI
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Content Platform
            </span>
          </Link>
          <p className="text-xs text-zinc-500 max-w-xs">
            Autonomous Content Operations for YouTube & Facebook
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
