import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import NewsletterForm from "@/components/NewsletterForm";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lattice - AIを使うなら、全部ここで。",
  description: "ChatGPT・Gemini・Claudeをリアルタイム比較、AIプロンプトの売買、AI活用情報まで。Latticeは日本のAI情報基地。",
};

async function getStats() {
  const [agentCount, totalUseCount] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.aggregate({ _sum: { useCount: true } }),
  ]);
  return { agentCount, totalUseCount: totalUseCount._sum.useCount ?? 0 };
}

async function getFeaturedAgents() {
  return prisma.agent.findMany({
    orderBy: { useCount: "desc" },
    take: 6,
    select: { id: true, name: true, description: true, category: true, price: true, useCount: true, authorName: true },
  });
}

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { slug: true, title: true, description: true, createdAt: true },
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

const OS_MODULES = [
  { href: "/work", icon: "💰", color: "#34d399", label: "Lattice Work", desc: "AIで副業・稼ぐ環境が全部揃う", badge: "NEW" },
  { href: "/marketplace", icon: "🛒", color: "#3b82f6", label: "プロンプトマーケット", desc: "厳選AIプロンプトを購入・販売", badge: null },
  { href: "/compare", icon: "⚡", color: "#a78bfa", label: "AI比較ツール", desc: "GPT・Claude・Geminiをリアルタイム比較", badge: null },
  { href: "/news", icon: "📰", color: "#60a5fa", label: "AIニュース", desc: "国内外の最新AI情報をまとめて", badge: null },
  { href: "/blog", icon: "✍️", color: "#fbbf24", label: "AIブログ", desc: "AI活用術・副業・最新情報", badge: null },
  { href: "/work/space", icon: "🚀", color: "#f472b6", label: "Work Space", desc: "副業の進捗・収益を管理する", badge: null },
] as const;

export default async function Home() {
  const [{ agentCount, totalUseCount }, featured, posts] = await Promise.all([
    getStats(), getFeaturedAgents(), getLatestPosts(),
  ]);

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', 'Noto Sans JP', sans-serif", overflowX: "hidden" }}>
      <style>{`
        .os-card { transition: border-color 0.15s, transform 0.15s; }
        .os-card:hover { border-color: #3b82f655 !important; transform: translateY(-2px); }
        .prompt-card { transition: border-color 0.15s; }
        .prompt-card:hover { border-color: #3b82f655 !important; }
        .blog-card { transition: border-color 0.15s; }
        .blog-card:hover { border-color: #3b82f655 !important; }
        .btn-primary:hover { opacity: 0.85; }
        .btn-secondary:hover { border-color: #4a5278 !important; }
      `}</style>
      <Nav />

      {/* HERO */}
      <section style={{ position: "relative", textAlign: "center", padding: "96px 24px 72px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", width: 700, height: 350, background: "radial-gradient(ellipse, #2563eb1a 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2563eb14", border: "1px solid #2563eb30", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#60a5fa", marginBottom: 28, letterSpacing: "0.04em", fontWeight: 600 }}>
          Lattice OS — AIの全てがここに
        </div>
        <h1 style={{ fontSize: "clamp(36px, 7vw, 68px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 20 }}>
          AIを使うなら、<br />
          <span style={{ color: "#3b82f6" }}>全部Latticeで。</span>
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "#8b92a9", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.75 }}>
          プロンプト売買・AI比較・副業スペース・最新情報。<br />AI時代を生き抜くための情報基地。
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/work" style={{ background: "#34d399", color: "#080b14", textDecoration: "none", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 900, display: "inline-block" }}>
            AIで副業を始める →
          </Link>
          <Link href="/compare" style={{ background: "transparent", color: "#e8eaf0", textDecoration: "none", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, border: "1px solid #2a2f42", display: "inline-block" }}>
            AI比較ツール
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

      {/* OS モジュール */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Lattice OS</h2>
          <p style={{ color: "#8b92a9", fontSize: 13 }}>AIに関するすべてが、ひとつの場所に</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {OS_MODULES.map((mod) => (
            <Link key={mod.href} href={mod.href} style={{ textDecoration: "none" }}>
              <div className="os-card" style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 14, padding: "22px 24px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, background: mod.color + "18", border: `1px solid ${mod.color}30`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {mod.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#e8eaf0" }}>{mod.label}</span>
                    {mod.badge && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "#2563eb30", color: "#60a5fa", letterSpacing: "0.05em" }}>
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#8b92a9", margin: 0 }}>{mod.desc}</p>
                </div>
                <span style={{ color: "#4a5068", fontSize: 16 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ニュースレター */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 80px" }}>
        <NewsletterForm />
      </section>

      {/* 人気プロンプト */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>人気のプロンプト</h2>
            <p style={{ color: "#8b92a9", fontSize: 13 }}>もっとも使われているプロンプト</p>
          </div>
          <Link href="/marketplace" style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>すべて見る →</Link>
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

      {/* 最新ブログ */}
      {posts.length > 0 && (
        <section style={{ background: "#0d1120", borderTop: "1px solid #1c2136", borderBottom: "1px solid #1c2136", padding: "64px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>最新記事</h2>
                <p style={{ color: "#8b92a9", fontSize: 13 }}>AI活用術・副業・最新情報</p>
              </div>
              <Link href="/blog" style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>すべて見る →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div className="blog-card" style={{ background: "#080b14", border: "1px solid #1c2136", borderRadius: 14, padding: "22px 24px" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0", marginBottom: 8, lineHeight: 1.5 }}>{post.title}</p>
                    <p style={{ fontSize: 12, color: "#8b92a9", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.description}</p>
                    <p style={{ fontSize: 11, color: "#4a5068" }}>{new Date(post.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>AI時代の情報基地へ、ようこそ</h2>
        <p style={{ color: "#8b92a9", fontSize: 14, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          副業・比較・情報・ツール。全部、Latticeで。
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/work" style={{ background: "#34d399", color: "#080b14", textDecoration: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 900, display: "inline-block" }}>
            AIで副業を始める →
          </Link>
          <Link href="/marketplace" style={{ background: "transparent", color: "#e8eaf0", textDecoration: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, border: "1px solid #2a2f42", display: "inline-block" }}>
            プロンプトを探す
          </Link>
        </div>
      </section>
    </main>
  );
}