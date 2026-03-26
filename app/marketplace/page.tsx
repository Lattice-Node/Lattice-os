import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIツール集 | Lattice",
  description: "フォームに入力するだけでAIがその場で作ってくれる。無料・登録不要。",
  keywords: ["AIツール", "AI 無料", "ChatGPT ツール", "AI 仕事効率化"],
  alternates: { canonical: "https://lattice-protocol.com/marketplace" },
};

export const revalidate = 3600;

const CATEGORY_MAP: Record<string, string> = {
  Writing: "文章・ライティング",
  Business: "ビジネス・仕事",
  Code: "コード・開発",
  Research: "調査・リサーチ",
  Finance: "財務・経理",
  Legal: "法律・契約",
  Medical: "医療・健康",
  Custom: "その他",
};

export default async function MarketplacePage() {
  const agents = await prisma.agent.findMany({
    orderBy: { useCount: "desc" },
  });

  const categories = ["すべて", "Writing", "Business", "Code", "Research", "Finance", "Legal", "Medical", "Custom"];

  return (
    <main style={{ minHeight: "100vh", background: "#f8f7f4", color: "#1a1a1a", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />

      <section style={{ background: "linear-gradient(180deg, #eeedf8 0%, #f8f7f4 100%)", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", color: "#6366f1", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 20 }}>
            すべて無料
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#1a1a1a", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            AIツール集
          </h1>
          <p style={{ fontSize: 16, color: "#5a5a5a", lineHeight: 1.8, maxWidth: 480, margin: "0 auto" }}>
            入力するだけでAIがその場で作ってくれる。登録不要。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        <div style={{ marginBottom: 28 }}>
          <input type="search" placeholder="ツールを検索..." style={{ width: "100%", padding: "13px 18px", background: "#fff", border: "1.5px solid #e8e6e0", borderRadius: 10, color: "#1a1a1a", fontSize: 15, outline: "none" }} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
          {categories.map((cat) => (
            <button key={cat} style={{ padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "1.5px solid #e8e6e0", background: cat === "すべて" ? "#6366f1" : "#fff", color: cat === "すべて" ? "#fff" : "#4b5563", cursor: "pointer" }}>
              {CATEGORY_MAP[cat] ?? cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 32, padding: "16px 20px", background: "#fff", borderRadius: 10, border: "1px solid #e8e6e0" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{agents.length}種類</span>
          <span style={{ fontSize: 12, color: "#9a9a9a" }}>公開中のツール</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {agents.map((agent) => (
            <div key={agent.id} style={{ background: "#fff", border: "1.5px solid #e8e6e0", borderRadius: 14, padding: "22px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "#ede9fe", padding: "3px 10px", borderRadius: 20 }}>
                  {CATEGORY_MAP[agent.category] ?? agent.category}
                </span>
                <span style={{ fontSize: 11, color: "#9a9a9a" }}>{agent.useCount}回使用</span>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8, lineHeight: 1.4 }}>{agent.name}</h2>
              <p style={{ fontSize: 13, color: "#5a5a5a", lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{agent.description}</p>
              <Link href={"/apps/" + agent.id} style={{ display: "block", textAlign: "center", padding: "11px", background: "#6366f1", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                使ってみる
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}