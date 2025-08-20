import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  assetPrefix: "/frontend",
  eslint: {
    ignoreDuringBuilds: true, // 👈 disables ESLint errors on build
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 disables TypeScript errors on build
  },
  async rewrites() {
    return [];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
