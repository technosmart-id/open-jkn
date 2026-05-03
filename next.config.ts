import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Silence Turbopack warning about webpack config
  turbopack: {},
  // Use Turbopack's serverExternalPackages for externals
  serverExternalPackages: ["svix"],
  // Ignore TypeScript errors during build (type checking should be done in CI/locally)
  // This prevents build hangs in memory-constrained environments
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "svix"];
    }
    return config;
  },
};

export default nextConfig;
