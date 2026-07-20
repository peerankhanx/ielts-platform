import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle in .next/standalone —
  // used by the Docker build so the runtime image doesn't need the full
  // node_modules tree.
  output: "standalone",
};

export default nextConfig;
