import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロンプト一覧 | Lattice - AIプロンプトマーケット",
  description: "ChatGPT・Claude対応のAIプロンプトを探せる。ビジネス・ライティング・コード・リサーチなど多数のカテゴリから無料・有料プロンプトを検索・購入できる。",
  openGraph: {
    title: "プロンプト一覧 | Lattice - AIプロンプトマーケット",
    description: "ChatGPT・Claude対応のAIプロンプトを探せる。無料から有料まで多数のプロンプトが揃っている。",
    url: "https://lattice-protocol.com/marketplace",
    siteName: "Lattice",
    locale: "ja_JP",
    type: "website",
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}