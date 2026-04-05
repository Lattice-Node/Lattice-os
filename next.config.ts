import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ビルド時のESLintエラーを無視（Next.js 15 + React 19の新ルール回避）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ビルド時のTypeScriptエラーを無視
  typescript: {
    ignoreBuildErrors: true,
  },
  // Turbopackバンドラーを有効化（既存の設定に合わせる）
  experimental: {
    turbo: {},
  },
  // 画像ドメイン許可（Lattice用）
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "www.lattice-protocol.com" },
    ],
  },
};

export default nextConfig;