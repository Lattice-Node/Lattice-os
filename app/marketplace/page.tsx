import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatGPTプロンプト無料テンプレート集 | Lattice AIプロンプトマーケット",
  description: "ChatGPT・Claude・Gemini対応のプロンプトテンプレートを無料で使える。仕事効率化・副業・ブログ作成・コード生成など31種類以上。コピペですぐ使える。",
  keywords: ["ChatGPTプロンプト", "プロンプト 無料", "AIプロンプト テンプレート", "ChatGPT 使い方", "プロンプト集"],
  openGraph: {
    title: "ChatGPTプロンプト無料テンプレート集 | Lattice",
    description: "コピペで使えるAIプロンプト31種類以上を無料公開。仕事効率化・副業・ブログ作成対応。",
    url: "https://lattice-protocol.com/marketplace",
    type: "website",
  },
  alternates: {
    canonical: "https://lattice-protocol.com/marketplace",
  },
};

export const revalidate = 3600;

export default async function MarketplacePage() {
  const agents = await prisma.agent.findMany({
    orderBy: { useCount: "desc" },
  });

  const categories = ["すべて", "Writing", "Business", "Code", "Research", "Finance", "Legal", "Medical", "Custom"];

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`.prompt-card { transition: border-color 0.15s; } .prompt-card:hover { border-color: #3b82f655 !important; } .cat-btn:hover { background: #1c2136 !important; }`}</style>
      <Nav />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>
            ChatGPTプロンプト集
          </h1>
          <p style={{ color: "#8b92a9", fontSize: 14 }}>
            コピーしてすぐ使える · Latticeでそのまま実行できる
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <input
            type="search"
            placeholder="プロンプトを検索..."
            style={{
              width: "100%", padding: "12px 16px", background: "#0d1120",
              border: "1px solid #1c2136", borderRadius: 10, color: "#e8eaf0",
              fontSize: 14, outline: "none", boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {categories.map((cat) => (
            <button key={cat} className="cat-btn" style={{
              padding: "6px 16px", borderRadius: 20, border: "1px solid #1c2136",
              background: cat === "すべて" ? "#1c2136" : "transparent",
              color: cat === "すべて" ? "#e8eaf0" : "#8b92a9",
              fontSize: 13, cursor: "pointer"
            }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {agents.map((agent) => (
            <div key={agent.id} className="prompt-card" style={{
              background: "#0d1120", border: "1px solid #1c2136",
              borderRadius: 12, padding: "20px", display: "flex", flexDirection: "column", gap: 12
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: getCategoryColor(agent.category), fontWeight: 700, marginBottom: 4 }}>
                    {agent.category}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e8eaf0" }}>{agent.name}</div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: agent.price === 0 ? "#22c55e" : "#f59e0b",
                  background: agent.price === 0 ? "#052e1680" : "#451a0380",
                  padding: "3px 10px", borderRadius: 20
                }}>
                  {agent.price === 0 ? "無料" : `¥${agent.price}`}
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#8b92a9", lineHeight: 1.6, margin: 0 }}>
                {agent.description}
              </p>

              <div style={{ fontSize: 11, color: "#4a5068" }}>
                by {agent.authorName} · {agent.useCount}回使用
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <button style={{
                  flex: 1, padding: "8px", background: "#1c2136",
                  border: "1px solid #2a3050", borderRadius: 8,
                  color: "#8b92a9", fontSize: 13, cursor: "pointer"
                }}>
                  コピー
                </button>
                <Link href={`/apps/${agent.id}`} style={{
                  flex: 2, padding: "8px", background: "#2563eb",
                  borderRadius: 8, color: "#fff", fontSize: 13,
                  fontWeight: 700, textDecoration: "none", textAlign: "center"
                }}>
                  実行する
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Writing: "#f59e0b", Business: "#3b82f6", Code: "#22c55e",
    Research: "#8b5cf6", Finance: "#06b6d4", Legal: "#ec4899",
    Medical: "#ef4444", Custom: "#f97316",
  };
  return colors[category] ?? "#8b92a9";
}