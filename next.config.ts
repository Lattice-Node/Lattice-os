import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "google-auth-library"],
  // ビルド時のESLintエラーを無視
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ビルド時のTypeScriptエラーを無視
  typescript: {
    ignoreBuildErrors: true,
  },
  // Turbopackバンドラー
  experimental: {
    turbo: {},
  },
  // 画像ドメイン許可
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "www.lattice-protocol.com" },
    ],
  },
};

export default nextConfig;
