import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lattice - 日本最大のAIプロンプトマーケット",
  description: "AIプロンプトを売り買いできる日本最大のマーケットプレイス。ChatGPT・Claude対応のプロンプトをコピーして使うか、そのままLatticeで実行。収益の80%を受け取れる。",
  keywords: ["AIプロンプト", "プロンプトマーケット", "ChatGPT", "Claude", "プロンプト販売", "Promptbase 日本語"],
  verification: {
    google: "ZpPUOe99Wj1YozE10oadL9VIO6ZTFx7eN5LRmzjCpBk",
  },
  openGraph: {
    title: "Lattice - 日本最大のAIプロンプトマーケット",
    description: "AIプロンプトを売り買いできる日本最大のマーケットプレイス。コピーして使うか、そのまま実行するか。",
    url: "https://lattice-protocol.com",
    siteName: "Lattice",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://lattice-protocol.com/og.png",
        width: 1200,
        height: 630,
        alt: "Lattice - 日本最大のAIプロンプトマーケット",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice - 日本最大のAIプロンプトマーケット",
    description: "AIプロンプトを売り買いできる日本最大のマーケットプレイス。",
    site: "@Lattice_Node",
    images: ["https://lattice-protocol.com/og.png"],
  },
  alternates: {
    canonical: "https://lattice-protocol.com",
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
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}