import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロンプトを出品する | Lattice - AIプロンプトマーケット",
  description: "あなたのAIプロンプトをLatticeで販売しよう。収益の80%を受け取れる。ChatGPT・Claude対応プロンプトの出品は無料。",
  openGraph: {
    title: "プロンプトを出品する | Lattice",
    description: "あなたのAIプロンプトをLatticeで販売しよう。収益の80%を受け取れる。",
    url: "https://lattice-protocol.com/publish",
    siteName: "Lattice",
    locale: "ja_JP",
    type: "website",
  },
};

export default function PublishLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}