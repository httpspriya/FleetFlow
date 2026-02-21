import type { NextConfig } from "next";
import path from "path";

const frontendDir = path.resolve(__dirname);

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: frontendDir,
  },
  webpack: (config) => {
    const frontendNodeModules = path.join(frontendDir, "node_modules");
    // Resolve from frontend first so tailwindcss etc. are found when run from monorepo root
    config.resolve.modules = [
      frontendNodeModules,
      ...(config.resolve.modules ?? []),
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(frontendNodeModules, "tailwindcss"),
      "@tailwindcss/postcss": path.join(frontendNodeModules, "@tailwindcss/postcss"),
    };
    return config;
  },
  experimental: {
    outputFileTracingRoot: frontendDir,
  },
};

export default nextConfig;
