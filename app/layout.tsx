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
  title: "Lattice - 譌･譛ｬ譛螟ｧ縺ｮAI繝励Ο繝ｳ繝励ヨ繝槭・繧ｱ繝・ヨ",
  description: "AI繝励Ο繝ｳ繝励ヨ繧貞｣ｲ繧願ｲｷ縺・〒縺阪ｋ譌･譛ｬ譛螟ｧ縺ｮ繝槭・繧ｱ繝・ヨ繝励Ξ繧､繧ｹ縲・hatGPT繝ｻClaude蟇ｾ蠢懊・繝励Ο繝ｳ繝励ヨ繧偵さ繝斐・縺励※菴ｿ縺・°縲√◎縺ｮ縺ｾ縺ｾLattice縺ｧ螳溯｡後ょ庶逶翫・80%繧貞女縺大叙繧後ｋ縲・,
  keywords: ["AI繝励Ο繝ｳ繝励ヨ", "繝励Ο繝ｳ繝励ヨ繝槭・繧ｱ繝・ヨ", "ChatGPT", "Claude", "繝励Ο繝ｳ繝励ヨ雋ｩ螢ｲ", "Promptbase 譌･譛ｬ隱・],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "ZpPUOe99Wj1YozE10oadL9VIO6ZTFx7eN5LRmzjCpBk",
  },
  openGraph: {
    title: "Lattice - 譌･譛ｬ譛螟ｧ縺ｮAI繝励Ο繝ｳ繝励ヨ繝槭・繧ｱ繝・ヨ",
    description: "AI繝励Ο繝ｳ繝励ヨ繧貞｣ｲ繧願ｲｷ縺・〒縺阪ｋ譌･譛ｬ譛螟ｧ縺ｮ繝槭・繧ｱ繝・ヨ繝励Ξ繧､繧ｹ縲ゅさ繝斐・縺励※菴ｿ縺・°縲√◎縺ｮ縺ｾ縺ｾ螳溯｡後☆繧九°縲・,
    url: "https://www.lattice-protocol.com",
    siteName: "Lattice",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://www.lattice-protocol.com/og.png",
        width: 1200,
        height: 630,
        alt: "Lattice - 譌･譛ｬ譛螟ｧ縺ｮAI繝励Ο繝ｳ繝励ヨ繝槭・繧ｱ繝・ヨ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice - 譌･譛ｬ譛螟ｧ縺ｮAI繝励Ο繝ｳ繝励ヨ繝槭・繧ｱ繝・ヨ",
    description: "AI繝励Ο繝ｳ繝励ヨ繧貞｣ｲ繧願ｲｷ縺・〒縺阪ｋ譌･譛ｬ譛螟ｧ縺ｮ繝槭・繧ｱ繝・ヨ繝励Ξ繧､繧ｹ縲・,
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
              <div style={{ fontSize: 13, color: "#4a5068" }}>ﾂｩ 2026 Lattice. All rights reserved.</div>
              <div style={{ display: "flex", gap: 24 }}>
                <Link href="/privacy" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>繝励Λ繧､繝舌す繝ｼ繝昴Μ繧ｷ繝ｼ</Link>
                <Link href="/terms" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>蛻ｩ逕ｨ隕冗ｴ・/Link>
                <a href="https://x.com/Lattice_Node" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#4a5068", textDecoration: "none" }}>X (Twitter)</a>
              </div>
            </footer>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}