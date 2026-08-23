import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center space-y-6 max-w-xl">
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
          Autonomous AI Content Automation Platform
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          Content that scales on autopilot.
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
          From trend research and fact verification to automated video rendering, thumbnails, and multi-platform publishing on YouTube & Facebook.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="shadow-md font-semibold">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="font-semibold">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
