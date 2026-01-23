import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Silence Turbopack warning about webpack config
  turbopack: {},
  // Use Turbopack's serverExternalPackages for externals
  serverExternalPackages: ["svix"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "svix"];
    }
    return config;
  },
};

export default nextConfig;
