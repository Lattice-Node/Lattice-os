import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lattice - ChatGPTプロンプト無料テンプレート・AI副業・比較ツール",
  description: "ChatGPTプロンプトを無料でコピペして使える。AI比較ツール・AI副業スペース・最新AIニュースも全部Latticeで。AIで稼ぐ・使いこなす・学ぶ日本のAIプラットフォーム。",
  keywords: ["ChatGPTプロンプト", "AIプロンプト 無料", "AI副業", "ChatGPT比較", "AIツール"],
  openGraph: {
    title: "Lattice - ChatGPTプロンプト無料テンプレート・AI副業・比較ツール",
    description: "ChatGPTプロンプトを無料でコピペして使える日本のAIプラットフォーム。",
    url: "https://lattice-protocol.com",
    type: "website",
    images: [{ url: "https://lattice-protocol.com/og.png" }],
  },
  alternates: {
    canonical: "https://lattice-protocol.com",
  },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [agents, posts] = await Promise.all([
    prisma.agent.findMany({ orderBy: { useCount: "desc" }, take: 6 }),
    prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const totalAgents = await prisma.agent.count();
  const totalUses = await prisma.agent.aggregate({ _sum: { useCount: true } });

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
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

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 24px 64px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{
          display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          color: "#6366f1", background: "#1e1b4b80", border: "1px solid #3730a380",
          padding: "4px 14px", borderRadius: 20, marginBottom: 24
        }}>
          Lattice OS — AIの全てがここに
        </div>

        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 20 }}>
          ChatGPTプロンプトを、<br />
          <span style={{ color: "#6366f1" }}>無料でそのまま使える。</span>
        </h1>

        <p style={{ fontSize: 16, color: "#8b92a9", lineHeight: 1.8, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
          コピペするだけで使えるプロンプト{totalAgents}種類以上。<br />
          AI比較・副業スペース・最新情報も全部ここで。
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/marketplace" className="btn-primary" style={{
            background: "#22c55e", color: "#fff", padding: "14px 28px",
            borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none"
          }}>
            無料プロンプトを使う
          </Link>
          <Link href="/compare" className="btn-secondary" style={{
            background: "transparent", color: "#e8eaf0", padding: "14px 28px",
            borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
            border: "1px solid #2a3050"
          }}>
            AI比較ツール
          </Link>
        </div>

        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 48, paddingTop: 32, borderTop: "1px solid #1c2136" }}>
          {[
            { value: `${totalAgents}件`, label: "のプロンプト" },
            { value: `${totalUses._sum.useCount ?? 0}回`, label: "実行済み" },
            { value: "80%", label: "収益を受け取れる" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#e8eaf0" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#4a5068", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OS Cards */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>Lattice OS</h2>
        <p style={{ color: "#8b92a9", fontSize: 14, textAlign: "center", marginBottom: 32 }}>AIに関するすべてが、ひとつの場所に</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {[
            { href: "/work", icon: "💰", title: "Lattice Work", badge: "NEW", desc: "AIで副業・稼ぐ環境が全部揃う" },
            { href: "/marketplace", icon: "🛒", title: "プロンプトマーケット", desc: "厳選AIプロンプトを購入・販売" },
            { href: "/compare", icon: "⚡", title: "AI比較ツール", desc: "GPT・Claude・Geminiをリアルタイム比較" },
            { href: "/news", icon: "📰", title: "AIニュース", desc: "国内外の最新AI情報をまとめて" },
            { href: "/blog", icon: "✍️", title: "AIブログ", desc: "AI活用術・副業・最新情報" },
            { href: "/work/space", icon: "🚀", title: "Work Space", desc: "副業の進捗・収益を管理する" },
          ].map((card) => (
            <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
              <div className="os-card" style={{
                background: "#0d1120", border: "1px solid #1c2136",
                borderRadius: 12, padding: "20px 20px", display: "flex", alignItems: "center", gap: 16
              }}>
                <div style={{
                  width: 44, height: 44, background: "#1c2136", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{card.title}</span>
                    {card.badge && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e", background: "#052e1680", padding: "2px 6px", borderRadius: 4 }}>
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#8b92a9" }}>{card.desc}</div>
                </div>
                <div style={{ color: "#4a5068", fontSize: 16 }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 64px", textAlign: "center" }}>
        <div style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 16, padding: "32px 24px" }}>
          <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>
            毎朝8時配信
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Lattice AI Morning</h2>
          <p style={{ fontSize: 13, color: "#8b92a9", marginBottom: 24, lineHeight: 1.7 }}>
            今日のAIニュース・使えるプロンプト・AI活用ヒントを毎朝メールでお届けします。無料。
          </p>
          <form style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              placeholder="メールアドレス"
              style={{
                flex: 1, padding: "10px 14px", background: "#080b14",
                border: "1px solid #2a3050", borderRadius: 8, color: "#e8eaf0",
                fontSize: 14, outline: "none"
              }}
            />
            <button type="submit" style={{
              padding: "10px 20px", background: "#6366f1", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer"
            }}>
              無料登録
            </button>
          </form>
          <p style={{ fontSize: 11, color: "#4a5068", marginTop: 10 }}>いつでも解除できます</p>
        </div>
      </section>

      {/* Popular Prompts */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>人気のプロンプト</h2>
            <p style={{ fontSize: 13, color: "#8b92a9" }}>もっとも使われているプロンプト</p>
          </div>
          <Link href="/marketplace" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>すべて見る →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {agents.map((agent) => (
            <div key={agent.id} className="prompt-card" style={{
              background: "#0d1120", border: "1px solid #1c2136", borderRadius: 12, padding: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#8b92a9" }}>{agent.category}</span>
                <span style={{ fontSize: 11, color: "#22c55e" }}>{agent.price === 0 ? "無料" : `¥${agent.price}`}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{agent.name}</div>
              <div style={{ fontSize: 12, color: "#8b92a9", lineHeight: 1.5, marginBottom: 12 }}>{agent.description}</div>
              <div style={{ fontSize: 11, color: "#4a5068", marginBottom: 12 }}>by {agent.authorName} · {agent.useCount}回使用</div>
              <Link href={`/apps/${agent.id}`} style={{
                display: "block", textAlign: "center", padding: "8px",
                background: "#2563eb", borderRadius: 8, color: "#fff",
                fontSize: 13, fontWeight: 700, textDecoration: "none"
              }}>
                実行する
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>最新記事</h2>
            <p style={{ fontSize: 13, color: "#8b92a9" }}>AI活用術・副業・最新情報</p>
          </div>
          <Link href="/blog" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>すべて見る →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div className="blog-card" style={{
                background: "#0d1120", border: "1px solid #1c2136", borderRadius: 12, padding: "20px", height: "100%", boxSizing: "border-box"
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0", marginBottom: 8, lineHeight: 1.4 }}>{post.title}</div>
                <div style={{ fontSize: 12, color: "#8b92a9", lineHeight: 1.6, marginBottom: 12 }}>{post.description}</div>
                <div style={{ fontSize: 11, color: "#4a5068" }}>{new Date(post.createdAt).toLocaleDateString("ja-JP")}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ textAlign: "center", padding: "48px 24px 80px" }}>
        <p style={{ fontSize: 13, color: "#4a5068", marginBottom: 8 }}>AI時代の情報基地へ、ようこそ</p>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>副業・比較・情報・ツール。全部、Latticeで。</h2>
        <Link href="/marketplace" className="btn-primary" style={{
          background: "#22c55e", color: "#fff", padding: "14px 32px",
          borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block", marginRight: 12
        }}>
          無料プロンプトを使う
        </Link>
        <Link href="/marketplace" style={{
          color: "#6366f1", fontSize: 14, textDecoration: "none"
        }}>
          プロンプトを探す →
        </Link>
      </section>
    </main>
  );
}