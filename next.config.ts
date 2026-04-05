import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Chrome Navigation Predictor対策：
  // /latticeauth/* を /api/auth/* に内部rewriteすることで、
  // ブラウザ履歴に残るURLを書き換え、phantom GETを回避する
  async rewrites() {
    return [
      {
        source: "/latticeauth/:path*",
        destination: "/api/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
