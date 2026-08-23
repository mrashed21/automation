import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/types", "@repo/config", "@repo/validation", "@repo/ui"],
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  reactCompiler: true,
};

export default nextConfig;
