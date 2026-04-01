import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import PushNotificationSetup from "@/components/PushNotificationSetup";
import BottomNav from "@/components/BottomNav";

const dmSans = DM_Sans({ subsets: ["latin"] });

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
  themeColor: "#0e1117",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={dmSans.className} style={{ margin: 0, padding: 0, background: "#0e1117" }}>
        <Providers>
          <div className="app-shell">{children}</div>
          <BottomNav />
          <PushNotificationSetup />
        </Providers>
      </body>
    </html>
  );
}
