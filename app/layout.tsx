import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import PushNotificationSetup from "@/components/PushNotificationSetup";
import BottomNav from "@/components/BottomNav";
import NetworkStatus from "@/components/NetworkStatus";
import MorningBriefingSetup from "@/components/MorningBriefingSetup";
import RevenueCatBoot from "@/components/RevenueCatBoot";
import BackgroundProvider from "@/components/BackgroundProvider";

export const metadata: Metadata = {
  title: "Lattice - 自然言語で動くAIエージェント",
  description: "話しかけるだけで業務を自動化。技術知識ゼロで使えるノーコード自動化プラットフォーム。",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Lattice" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>
          <div className="app-shell">{children}</div>
          <BottomNav />
          <PushNotificationSetup />
          <NetworkStatus />
          <MorningBriefingSetup />
          <RevenueCatBoot />
          <BackgroundProvider />
        </Providers>
      </body>
    </html>
  );
}
