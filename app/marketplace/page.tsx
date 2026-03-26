import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "無料AIツール集・ChatGPTプロンプトテンプレート | Lattice",
  description: "コピペですぐ使えるAIプロンプト31種類以上。ビジネス文書・メール・企画書・副業・法律・医療など幅広いジャンルに対応。ChatGPT・Claude・Gemini対応。すべて無料。",
  keywords: ["ChatGPTプロンプト", "AIプロンプト 無料", "プロンプト テンプレート", "ChatGPT 使い方", "AI 仕事効率化", "プロンプト集"],
  openGraph: {
    title: "無料AIツール集・ChatGPTプロンプトテンプレート | Lattice",
    description: "コピペですぐ使えるAIプロンプト31種類以上。すべて無料。",
    url: "https://lattice-protocol.com/marketplace",
    type: "website",
  },
  alternates: { canonical: "https://lattice-protocol.com/marketplace" },
};

export const revalidate = 3600;

const CATEGORY_MAP: Record<string, string> = {
  "すべて": "すべて",
  "Writing": "文章・ライティング",
  "Business": "ビジネス・仕事",
  "Code": "コード・開発",
  "Research": "調査・リサーチ",
  "Finance": "財務・経理",
  "Legal": "法律・契約",
  "Medical": "医療・健康",
  "Custom": "その他",
};

export default async function MarketplacePage() {
  const agents = await prisma.agent.findMany({
    orderBy: { useCount: "desc" },
  });

  const categories = ["すべて", "Writing", "Business", "Code", "Research", "Finance", "Legal", "Medical", "Custom"];
  const totalFree = agents.filter(a => a.price === 0).length;

  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: "#111827", fontFamily: "'DM Sans', 'Hiragino Sans', 'Yu Gothic', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .prompt-card { transition: box-shadow 0.2s, transform 0.2s; }
        .prompt-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09); transform: translateY(-2px); }
        .cat-btn { transition: all 0.15s; cursor: pointer; }
        .cat-btn:hover { background: #ede9fe !important; color: #6366f1 !important; }
        .copy-btn { transition: background 0.15s; }
        .copy-btn:hover { background: #f3f4f6 !important; }
        .run-btn { transition: background 0.15s; }
        .run-btn:hover { background: #4f46e5 !important; }
      `}</style>

      <Nav />

      {/* Hero */}
      <section style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #fff 100%)", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#ede9fe", color: "#6366f1",
            fontSize: 12, fontWeight: 700, padding: "5px 14px",
            borderRadius: 20, marginBottom: 20, letterSpacing: "0.05em"
          }}>
            すべて無料 · {totalFree}種類以上
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            コピペで使えるAIプロンプト集
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.8, marginBottom: 0, maxWidth: 560, margin: "0 auto" }}>
            ChatGPT・Claude・Gemini対応。仕事・副業・日常生活で使えるテンプレートを無料公開。<br />
            そのままLatticeで実行もできます。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Search */}
        <div style={{ marginBottom: 28 }}>
          <input
            type="search"
            placeholder="プロンプトを検索..."
            style={{
              width: "100%", padding: "13px 18px",
              background: "#f9fafb", border: "1.5px solid #e5e7eb",
              borderRadius: 10, color: "#111827",
              fontSize: 15, outline: "none",
            }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
          {categories.map((cat) => (
            <button key={cat} className="cat-btn" style={{
              padding: "8px 18px", borderRadius: 20,
              fontSize: 13, fontWeight: 600,
              border: "1.5px solid #e5e7eb",
              background: cat === "すべて" ? "#6366f1" : "#fff",
              color: cat === "すべて" ? "#fff" : "#4b5563",
              cursor: "pointer"
            }}>
              {CATEGORY_MAP[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 24, marginBottom: 32,
          padding: "16px 20px", background: "#f9fafb",
          borderRadius: 10, border: "1px solid #f3f4f6"
        }}>
          {[
            { label: "公開中のツール", value: `${agents.length}種類` },
            { label: "無料で使える", value: `${totalFree}種類` },
            { label: "対応AI", value: "ChatGPT・Claude・Gemini" },
          ].map(stat => (
            <div key={stat.label}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{stat.value}</span>
              <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 6 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {agents.map((agent) => (
            <div key={agent.id} className="prompt-card" style={{
              background: "#fff", border: "1.5px solid #f0f0f0",
              borderRadius: 14, padding: "22px",
              display: "flex", flexDirection: "column", gap: 0
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: "#6366f1", background: "#ede9fe",
                  padding: "3px 10px", borderRadius: 20
                }}>
                  {CATEGORY_MAP[agent.category] ?? agent.category}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: agent.price === 0 ? "#10b981" : "#f59e0b",
                  background: agent.price === 0 ? "#d1fae5" : "#fef3c7",
                  padding: "3px 10px", borderRadius: 20
                }}>
                  {agent.price === 0 ? "無料" : `¥${agent.price}`}
                </span>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8, lineHeight: 1.4, margin: "0 0 8px 0" }}>
                {agent.name}
              </h2>

              {/* Description */}
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                {agent.description}
              </p>

              {/* Meta */}
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>
                {agent.useCount > 0 ? `${agent.useCount}回使用` : "新着"} · {agent.authorName}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="copy-btn" style={{
                  flex: 1, padding: "10px",
                  background: "#f9fafb", border: "1.5px solid #e5e7eb",
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  color: "#4b5563", cursor: "pointer"
                }}>
                  コピー
                </button>
                <Link href={`/apps/${agent.id}`} className="run-btn" style={{
                  flex: 2, padding: "10px",
                  background: "#6366f1", borderRadius: 8,
                  fontSize: 13, fontWeight: 700,
                  color: "#fff", textDecoration: "none",
                  textAlign: "center", display: "block"
                }}>
                  Latticeで実行する →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SEO Footer Text */}
        <section style={{ marginTop: 72, padding: "40px", background: "#f9fafb", borderRadius: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.02em" }}>
            ChatGPTプロンプトとは？使い方ガイド
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.9, maxWidth: 720 }}>
            プロンプトとは、AIに与える指示文のことです。同じ質問でも、プロンプトの書き方を工夫するだけで、AIの回答の質が大きく変わります。
            Latticeのプロンプト集は、仕事・副業・日常生活で使えるテンプレートをコピペですぐに使えるよう整理しています。
            ChatGPT・Claude・Geminiなど主要なAIサービスすべてに対応しており、登録不要で無料でご利用いただけます。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 24 }}>
            {[
              { title: "ビジネス文書作成", desc: "提案書・議事録・メールをAIで自動生成" },
              { title: "副業・フリーランス", desc: "営業文・ポートフォリオ・請求書" },
              { title: "コード・開発", desc: "バグ修正・コードレビュー・設計" },
              { title: "調査・リサーチ", desc: "市場調査・競合分析・要約" },
              { title: "法律・契約", desc: "契約書チェック・法的文書作成" },
              { title: "医療・健康", desc: "症状説明・医療情報の整理" },
            ].map(item => (
              <div key={item.title} style={{ padding: "14px 16px", background: "#fff", borderRadius: 10, border: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}