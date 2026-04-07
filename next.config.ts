import type { NextConfig } from "next";

const isCapacitor = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isCapacitor ? { output: "export" as const, distDir: "out", trailingSlash: true } : {}),
  serverExternalPackages: ["firebase-admin", "google-auth-library"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {},
  },
  images: {
    ...(isCapacitor ? { unoptimized: true } : {}),
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "www.lattice-protocol.com" },
    ],
  },
};

export default nextConfig;
