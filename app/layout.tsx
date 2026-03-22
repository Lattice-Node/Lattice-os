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
  title: "\u30e9\u30c6\u30a3\u30b9 - \u65e5\u672c\u6700\u5927\u306eAI\u30d7\u30ed\u30f3\u30d7\u30c8\u30de\u30fc\u30b1\u30c3\u30c8 | Lattice",
  description: "AI\u30d7\u30ed\u30f3\u30d7\u30c8\u3092\u58f2\u308a\u8cb7\u3044\u3067\u304d\u308b\u65e5\u672c\u6700\u5927\u306e\u30de\u30fc\u30b1\u30c3\u30c8\u30d7\u30ec\u30a4\u30b9\u3002ChatGPT\u30fbClaude\u5bfe\u5fdc\u3002\u30b3\u30d4\u30fc\u3057\u3066\u4f7f\u3046\u304b\u3001\u305d\u306e\u307e\u307eLattice\u3067\u5b9f\u884c\u3002\u53ce\u76ca\u306e80\uff05\u3092\u53d7\u3051\u53d6\u308c\u308b\u3002",
  keywords: ["AI\u30d7\u30ed\u30f3\u30d7\u30c8", "\u30d7\u30ed\u30f3\u30d7\u30c8\u30de\u30fc\u30b1\u30c3\u30c8", "ChatGPT", "Claude", "\u30d7\u30ed\u30f3\u30d7\u30c8\u8ca9\u58f2", "Promptbase \u65e5\u672c\u8a9e"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "ZpPUOe99Wj1YozE10oadL9VIO6ZTFx7eN5LRmzjCpBk",
  },
  openGraph: {
    title: "Lattice - \u65e5\u672c\u6700\u5927\u306eAI\u30d7\u30ed\u30f3\u30d7\u30c8\u30de\u30fc\u30b1\u30c3\u30c8",
    description: "AI\u30d7\u30ed\u30f3\u30d7\u30c8\u3092\u58f2\u308a\u8cb7\u3044\u3067\u304d\u308b\u65e5\u672c\u6700\u5927\u306e\u30de\u30fc\u30b1\u30c3\u30c8\u30d7\u30ec\u30a4\u30b9\u3002\u30b3\u30d4\u30fc\u3057\u3066\u4f7f\u3046\u304b\u3001\u305d\u306e\u307e\u307e\u5b9f\u884c\u3059\u308b\u304b\u3002",
    url: "https://www.lattice-protocol.com",
    siteName: "Lattice",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://www.lattice-protocol.com/og.png",
        width: 1200,
        height: 630,
        alt: "Lattice - \u65e5\u672c\u6700\u5927\u306eAI\u30d7\u30ed\u30f3\u30d7\u30c8\u30de\u30fc\u30b1\u30c3\u30c8",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice - \u65e5\u672c\u6700\u5927\u306eAI\u30d7\u30ed\u30f3\u30d7\u30c8\u30de\u30fc\u30b1\u30c3\u30c8",
    description: "AI\u30d7\u30ed\u30f3\u30d7\u30c8\u3092\u58f2\u308a\u8cb7\u3044\u3067\u304d\u308b\u65e5\u672c\u6700\u5927\u306e\u30de\u30fc\u30b1\u30c3\u30c8\u30d7\u30ec\u30a4\u30b9\u3002",
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
                <Link href="/privacy" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u30dd\u30ea\u30b7\u30fc</Link>
                <Link href="/terms" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>\u5229\u7528\u898f\u7d04</Link>
                <a href="https://x.com/Lattice_Node" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>X (Twitter)</a>
              </div>
            </footer>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}