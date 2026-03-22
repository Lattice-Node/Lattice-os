import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/lib/theme";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lattice - AIを使うなら、全部ここで。",
  description: "ChatGPT・Gemini・Claudeをリアルタイム比較。AIプロンプトの売買。AI活用情報。日本のAI情報基地。",
  keywords: ["AI比較", "ChatGPT", "Claude", "Gemini", "AIプロンプト", "プロンプトマーケット", "AI tools", "Lattice"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "ZpPUOe99Wj1YozE10oadL9VIO6ZTFx7eN5LRmzjCpBk",
  },
  openGraph: {
    title: "Lattice - AIを使うなら、全部ここで。",
    description: "ChatGPT・Gemini・Claudeをリアルタイム比較。AIプロンプトの売買。AI活用情報。日本のAI情報基地。",
    url: "https://www.lattice-protocol.com",
    siteName: "Lattice",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://www.lattice-protocol.com/og.png",
        width: 1200,
        height: 630,
        alt: "Lattice - AIを使うなら、全部ここで。",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice - AIを使うなら、全部ここで。",
    description: "ChatGPT・Gemini・Claudeをリアルタイム比較。AIプロンプトの売買。AI活用情報。日本のAI情報基地。",
    site: "@Lattice_Node",
    images: ["https://www.lattice-protocol.com/og.png"],
  },
  alternates: {
    canonical: "https://www.lattice-protocol.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta property="og:image" content="https://www.lattice-protocol.com/og.png"/>
        <meta name="twitter:image" content="https://www.lattice-protocol.com/og.png"/>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WE3KKYTWFJ"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WE3KKYTWFJ');
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <AppProvider>
            {children}
            <footer style={{ borderTop: "1px solid #1c2136", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "#080b14" }}>
              <div style={{ fontSize: 13, color: "#4a5068" }}>&copy; 2026 Lattice. All rights reserved.</div>
              <div style={{ display: "flex", gap: 24 }}>
                <Link href="/privacy" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>プライバシーポリシー</Link>
                <Link href="/terms" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>利用規約</Link>
                <a href="https://x.com/Lattice_Node" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>X (Twitter)</a>
              </div>
            </footer>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}