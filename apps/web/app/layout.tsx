import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Content Platform",
    template: "%s | AI Content Platform",
  },
  description:
    "Autonomous AI Content Operations Platform for YouTube and Facebook. Research, produce, verify, and publish content automatically.",
  keywords: ["AI", "content automation", "YouTube", "Facebook", "content creation"],
  robots: "noindex, nofollow", // Internal tool — no public indexing
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
