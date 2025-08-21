import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // 👈 disables ESLint errors on build
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 disables TypeScript errors on build
  },
};

export default nextConfig;
