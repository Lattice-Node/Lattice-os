import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";

export const revalidate = 60;

async function getStats() {
  const [agentCount, totalUseCount] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.aggregate({ _sum: { useCount: true } }),
  ]);
  return {
    agentCount,
    totalUseCount: totalUseCount._sum.useCount ?? 0,
  };
}

async function getFeaturedAgents() {
  return prisma.agent.findMany({
    orderBy: { useCount: "desc" },
    take: 6,
    select: { id: true, name: true, description: true, category: true, price: true, useCount: true, authorName: true },
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  Research: "#4FC3F7", Writing: "#81C784", Code: "#FF8A65",
  Business: "#CE93D8", Medical: "#F06292", Legal: "#FFD54F",
  Finance: "#4DB6AC", Custom: "#FF8A65", default: "#90A4AE",
};
const CATEGORY_ICONS: Record<string, string> = {
  Research: "🔍", Writing: "✍️", Code: "💻",
  Business: "📊", Medical: "🏥", Legal: "⚖️",
  Finance: "💰", Custom: "⚡", default: "🧩",
};

export default async function Home() {
  const [{ agentCount, totalUseCount }, featured] = await Promise.all([
    getStats(),
    getFeaturedAgents(),
  ]);

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', 'Noto Sans JP', sans-serif", overflowX: "hidden" }}>
      <style>{`
        .prompt-card { transition: border-color 0.15s; }
        .prompt-card:hover { border-color: #3b82f655 !important; }
        .btn-primary { transition: opacity 0.15s; }
        .btn-primary:hover { opacity: 0.85; }
        .btn-secondary { transition: border-color 0.15s; }
        .btn-secondary:hover { border-color: #4a5278 !important; }
        .link-blue:hover { opacity: 0.75; }
      `}</style>
      <Nav />

      {/* HERO */}
      <section style={{ position: "relative", textAlign: "center", padding: "96px 24px 80px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, #2563eb22 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2563eb14", border: "1px solid #2563eb30", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#60a5fa", marginBottom: 28, letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, background: "#60a5fa", borderRadius: "50%", display: "inline-block" }} />
          日本最大のプロンプトマーケット
        </div>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 20 }}>
          使えるAIプロンプトを<br />
          <span style={{ color: "#3b82f6" }}>すぐ見つけて、今すぐ使う</span>
        </h1>

        <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "#8b92a9", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.75 }}>
          厳選されたAIプロンプトを購入・販売できるプラットフォーム。<br />
          コピーして使うか、そのままLatticeで実行するか。あなたが選ぶ。
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/marketplace" className="btn-primary" style={{ background: "#2563eb", color: "#fff", textDecoration: "none", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, display: "inline-block" }}>
            プロンプトを探す →
          </Link>
          <Link href="/publish" className="btn-secondary" style={{ background: "transparent", color: "#e8eaf0", textDecoration: "none", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, border: "1px solid #2a2f42", display: "inline-block" }}>
            プロンプトを販売する
          </Link>
        </div>

        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 56, color: "#8b92a9", fontSize: 14, flexWrap: "wrap" }}>
          <div><span style={{ color: "#e8eaf0", fontWeight: 800, fontSize: 22 }}>{agentCount.toLocaleString()}</span> 件のプロンプト</div>
          <div style={{ borderLeft: "1px solid #2a2f42" }} />
          <div><span style={{ color: "#e8eaf0", fontWeight: 800, fontSize: 22 }}>{totalUseCount.toLocaleString()}</span> 回実行済み</div>
          <div style={{ borderLeft: "1px solid #2a2f42" }} />
          <div><span style={{ color: "#e8eaf0", fontWeight: 800, fontSize: 22 }}>80%</span> 収益を受け取れる</div>
        </div>
      </section>

      {/* 人気プロンプト */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>人気のプロンプト</h2>
            <p style={{ color: "#8b92a9", fontSize: 13 }}>もっとも使われているプロンプト</p>
          </div>
          <Link href="/marketplace" className="link-blue" style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            すべて見る →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {featured.map((agent) => {
            const color = CATEGORY_COLORS[agent.category] ?? CATEGORY_COLORS.default;
            const icon = CATEGORY_ICONS[agent.category] ?? CATEGORY_ICONS.default;
            return (
              <Link key={agent.id} href={`/apps/${agent.id}`} style={{ textDecoration: "none" }}>
                <div className="prompt-card" style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 14, padding: "20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, background: color + "18", border: `1px solid ${color}30`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#e8eaf0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: "#8b92a9" }}>by {agent.authorName} · {agent.useCount}回使用</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: agent.price === 0 ? "#34d399" : "#3b82f6", flexShrink: 0 }}>
                      {agent.price === 0 ? "無料" : `¥${agent.price}`}
                    </div>
                  </div>
                  <p style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {agent.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 使い方 */}
      <section style={{ background: "#0d1120", borderTop: "1px solid #1c2136", borderBottom: "1px solid #1c2136", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 48 }}>3ステップで始められる</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            {[
              { num: "01", title: "プロンプトを探す", desc: "カテゴリや検索でプロンプトを見つける。無料から有料まで揃っている。" },
              { num: "02", title: "コピーまたは実行", desc: "プロンプトをコピーしてChatGPTで使うか、Lattice上でそのまま実行する。" },
              { num: "03", title: "気に入ったら販売", desc: "自分のプロンプトを公開して販売。収益の80%があなたに入る。" },
            ].map((step) => (
              <div key={step.num} style={{ textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", letterSpacing: "0.1em", marginBottom: 12 }}>{step.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#8b92a9", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>プロンプトで稼ぐ、一番シンプルな方法</h2>
        <p style={{ color: "#8b92a9", fontSize: 14, marginBottom: 32 }}>今すぐ無料で始めて、あなたのプロンプトをマーケットに出そう</p>
        <Link href="/publish" className="btn-primary" style={{ background: "#2563eb", color: "#fff", textDecoration: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, display: "inline-block" }}>
          無料で出品する →
        </Link>
      </section>
    </main>
  );
}
