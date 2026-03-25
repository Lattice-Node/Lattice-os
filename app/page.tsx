import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lattice - AIをもっと身近に。プロンプト・比較・副業・ニュース",
  description: "ChatGPTプロンプトを無料でコピペして使える。複数AIを同時比較、AI副業スペース、最新AIニュース。AIをもっと身近にするプラットフォーム。",
  keywords: ["ChatGPTプロンプト", "AIプロンプト 無料", "AI副業", "ChatGPT比較", "AIツール"],
  openGraph: {
    title: "Lattice - AIをもっと身近に。",
    description: "プロンプト・比較・副業・ニュース。全部Latticeで。",
    url: "https://lattice-protocol.com",
    type: "website",
    images: [{ url: "https://lattice-protocol.com/og.png" }],
  },
  alternates: { canonical: "https://lattice-protocol.com" },
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
    <main style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "'DM Sans', 'Hiragino Sans', 'Yu Gothic', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .card { transition: box-shadow 0.2s, transform 0.2s; }
        .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); transform: translateY(-2px); }
        .btn-primary { transition: background 0.15s; }
        .btn-primary:hover { background: #4f46e5 !important; }
        .btn-secondary { transition: border-color 0.15s, background 0.15s; }
        .btn-secondary:hover { background: #f5f5f5 !important; }
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #6366f1 !important; }
      `}</style>

      {/* Nav */}
      <Nav />

      {/* Hero */}
      <section style={{ background: "linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)", padding: "80px 24px 72px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#ede9fe", color: "#6366f1",
            fontSize: 13, fontWeight: 600, padding: "6px 16px",
            borderRadius: 20, marginBottom: 28
          }}>
            AIをもっと身近に
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 800, lineHeight: 1.2,
            letterSpacing: "-0.02em", color: "#111827",
            marginBottom: 20
          }}>
            AIと、<span style={{ color: "#6366f1" }}>もっと自由に。</span>
          </h1>

          <p style={{
            fontSize: 18, color: "#6b7280", lineHeight: 1.8,
            marginBottom: 40, maxWidth: 480, margin: "0 auto 40px"
          }}>
            プロンプト集・AI比較・副業スペース・最新ニュース。<br />
            AIを使いたいすべての人のためのプラットフォーム。
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/marketplace" className="btn-primary" style={{
              background: "#6366f1", color: "#fff",
              padding: "14px 32px", borderRadius: 10,
              fontWeight: 700, fontSize: 16,
              textDecoration: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.35)"
            }}>
              無料で始める
            </Link>
            <Link href="/compare" className="btn-secondary" style={{
              background: "#fff", color: "#374151",
              padding: "14px 32px", borderRadius: 10,
              fontWeight: 700, fontSize: 16,
              textDecoration: "none", border: "1.5px solid #e5e7eb"
            }}>
              AIを比較する
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 0, justifyContent: "center",
            marginTop: 56, paddingTop: 40,
            borderTop: "1px solid #f3f4f6"
          }}>
            {[
              { value: `${totalAgents}+`, label: "無料プロンプト" },
              { value: `${totalUses._sum.useCount ?? 0}`, label: "実行回数" },
              { value: "80%", label: "出品者の収益" },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                textAlign: "center", flex: 1,
                borderRight: i < 2 ? "1px solid #f3f4f6" : "none",
                padding: "0 24px"
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginBottom: 12, letterSpacing: "-0.02em" }}>
            全部、ここで完結する
          </h2>
          <p style={{ fontSize: 16, color: "#6b7280" }}>AIに関するすべてがひとつの場所に</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {[
            {
              href: "/marketplace",
              emoji: "prompts",
              title: "プロンプト集",
              desc: "コピペで使えるAIプロンプト31種類以上。仕事・副業・日常に使えるテンプレートが無料。",
              tag: "無料",
              tagColor: "#10b981"
            },
            {
              href: "/compare",
              emoji: "compare",
              title: "AI比較ツール",
              desc: "ChatGPT・Claude・Geminiに同じ質問を同時送信。どのAIが自分に合うか5分でわかる。",
              tag: "人気",
              tagColor: "#f59e0b"
            },
            {
              href: "/work",
              emoji: "work",
              title: "AI副業スペース",
              desc: "AIを使った副業の進捗・収益を管理。目標設定からログまで全部ここで。",
              tag: "NEW",
              tagColor: "#6366f1"
            },
            {
              href: "/news",
              emoji: "news",
              title: "AIニュース",
              desc: "国内外の最新AI情報を毎時自動更新。日本語・英語の両方に対応。",
              tag: "自動更新",
              tagColor: "#6b7280"
            },
            {
              href: "/blog",
              emoji: "blog",
              title: "AI活用ブログ",
              desc: "ChatGPT活用術・AI副業の始め方・最新AIツール解説を毎週更新。",
              tag: "毎週更新",
              tagColor: "#6b7280"
            },
            {
              href: "/work/space",
              emoji: "space",
              title: "Work Space",
              desc: "副業の作業ログを記録。AIが月次の収益を分析してアドバイスをくれる。",
              tag: "AI分析",
              tagColor: "#10b981"
            },
          ].map((card) => (
            <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{
                background: "#fff", border: "1.5px solid #f3f4f6",
                borderRadius: 16, padding: "28px 24px",
                height: "100%"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, background: "#f5f3ff",
                    borderRadius: 12, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#6366f1", fontWeight: 800
                  }}>
                    {card.emoji.slice(0, 3).toUpperCase()}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: card.tagColor,
                    background: card.tagColor + "18",
                    padding: "3px 10px", borderRadius: 20
                  }}>
                    {card.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 10 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Prompts */}
      <section style={{ background: "#fafafa", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
                人気のプロンプト
              </h2>
              <p style={{ fontSize: 14, color: "#9ca3af" }}>コピペですぐ使える · 無料</p>
            </div>
            <Link href="/marketplace" style={{
              fontSize: 14, color: "#6366f1", textDecoration: "none",
              fontWeight: 600, display: "flex", alignItems: "center", gap: 4
            }}>
              すべて見る →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {agents.map((agent) => (
              <div key={agent.id} className="card" style={{
                background: "#fff", border: "1.5px solid #f3f4f6",
                borderRadius: 14, padding: "22px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: "#6366f1", background: "#ede9fe",
                    padding: "3px 10px", borderRadius: 20
                  }}>
                    {agent.category}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: agent.price === 0 ? "#10b981" : "#f59e0b"
                  }}>
                    {agent.price === 0 ? "無料" : `¥${agent.price}`}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8, lineHeight: 1.4 }}>
                  {agent.name}
                </h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16 }}>
                  {agent.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    {agent.useCount}回使用
                  </span>
                  <Link href={`/apps/${agent.id}`} style={{
                    background: "#6366f1", color: "#fff",
                    padding: "8px 18px", borderRadius: 8,
                    fontSize: 13, fontWeight: 700,
                    textDecoration: "none"
                  }}>
                    使ってみる
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: "#6366f1", padding: "72px 24px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontSize: 12, color: "#c7d2fe", fontWeight: 700,
            letterSpacing: "0.1em", marginBottom: 16
          }}>
            毎朝8時配信
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>
            Lattice AI Morning
          </h2>
          <p style={{ fontSize: 15, color: "#c7d2fe", marginBottom: 32, lineHeight: 1.8 }}>
            今日のAIニュース・使えるプロンプト・活用ヒントを<br />毎朝メールでお届け。無料。
          </p>
          <form style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto" }}>
            <input
              type="email"
              placeholder="メールアドレスを入力"
              style={{
                flex: 1, padding: "12px 18px",
                borderRadius: 10, border: "none",
                fontSize: 15, outline: "none", color: "#111827"
              }}
            />
            <button type="submit" style={{
              padding: "12px 24px", background: "#fff",
              color: "#6366f1", border: "none",
              borderRadius: 10, fontSize: 15,
              fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
            }}>
              登録する
            </button>
          </form>
          <p style={{ fontSize: 12, color: "#a5b4fc", marginTop: 14 }}>いつでも解除できます</p>
        </div>
      </section>

      {/* Blog */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
              最新記事
            </h2>
            <p style={{ fontSize: 14, color: "#9ca3af" }}>AI活用術・副業・最新情報</p>
          </div>
          <Link href="/blog" style={{ fontSize: 14, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
            すべて見る →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{
                background: "#fff", border: "1.5px solid #f3f4f6",
                borderRadius: 14, padding: "24px", height: "100%"
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 10, lineHeight: 1.5 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 16 }}>
                  {post.description}
                </p>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ background: "#f9fafb", padding: "72px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.02em" }}>
          今日から、AIをもっと使いこなそう。
        </h2>
        <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 36 }}>
          無料で始められる。登録不要のプロンプトも31種類以上。
        </p>
        <Link href="/marketplace" style={{
          background: "#6366f1", color: "#fff",
          padding: "16px 40px", borderRadius: 12,
          fontWeight: 700, fontSize: 16,
          textDecoration: "none", display: "inline-block",
          boxShadow: "0 4px 14px rgba(99,102,241,0.35)"
        }}>
          無料で始める
        </Link>
      </section>
    </main>
  );
}