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
  title: "Lattice - AIpuromputomaaketto",
  description: "AIpuromputowouurikaidekiru nihon saidai no maaketopureisu.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "ZpPUOe99Wj1YozE10oadL9VIO6ZTFx7eN5LRmzjCpBk",
  },
  openGraph: {
    title: "Lattice - Japan AI Prompt Market",
    description: "Buy and sell AI prompts. Copy to use or run on Lattice.",
    url: "https://www.lattice-protocol.com",
    siteName: "Lattice",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://www.lattice-protocol.com/og.png",
        width: 1200,
        height: 630,
        alt: "Lattice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice - Japan AI Prompt Market",
    description: "Buy and sell AI prompts.",
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
              <div style={{ fontSize: 13, color: "#4a5068" }}>2026 Lattice. All rights reserved.</div>
              <div style={{ display: "flex", gap: 24 }}>
                <Link href="/privacy" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/terms" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>Terms</Link>
                <a href="https://x.com/Lattice_Node" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>X</a>
              </div>
            </footer>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}