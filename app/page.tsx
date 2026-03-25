import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lattice - AIと、生きていく。日本のAI OS",
  description: "ChatGPTプロンプトを無料で使える。AI比較・副業スペース・最新AIニュース。日本人がAIを使い始める、使い続ける場所。Latticeは日本語圏のAI OS。",
  keywords: ["ChatGPTプロンプト", "AIプロンプト 無料", "AI副業", "ChatGPT比較", "AI OS", "日本語AI"],
  openGraph: {
    title: "Lattice - AIと、生きていく。",
    description: "日本人がAIを使い始める、使い続ける場所。",
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
        .soon-badge { font-size: 9px; font-weight: 800; color: #6366f1; background: #1e1b4b80; padding: 2px 7px; border-radius: 10px; border: 1px solid #3730a380; }
      `}</style>
      <Nav />

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "88px 24px 72px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{
          display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          color: "#6366f1", background: "#1e1b4b80", border: "1px solid #3730a380",
          padding: "4px 14px", borderRadius: 20, marginBottom: 28
        }}>
          Japan AI OS
        </div>

        <h1 style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 24 }}>
          AIと、<span style={{ color: "#6366f1" }}>生きていく。</span>
        </h1>

        <p style={{ fontSize: 17, color: "#8b92a9", lineHeight: 1.9, marginBottom: 16, maxWidth: 540, margin: "0 auto 16px" }}>
          使うほど、あなた専用になる。
        </p>
        <p style={{ fontSize: 14, color: "#4a5068", lineHeight: 1.8, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
          プロンプト {totalAgents}種類・AI比較・副業スペース・最新情報。<br />
          日本人がAIを使い始め、使い続ける場所。
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/marketplace" className="btn-primary" style={{
            background: "#6366f1", color: "#fff", padding: "14px 32px",
            borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
            letterSpacing: "-0.01em"
          }}>
            Latticeを始める（無料）
          </Link>
          <Link href="/compare" className="btn-secondary" style={{
            background: "transparent", color: "#e8eaf0", padding: "14px 28px",
            borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
            border: "1px solid #2a3050"
          }}>
            AI比較ツール
          </Link>
        </div>

        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 56, paddingTop: 32, borderTop: "1px solid #1c2136" }}>
          {[
            { value: `${totalAgents}種類`, label: "プロンプト" },
            { value: `${totalUses._sum.useCount ?? 0}回`, label: "実行済み" },
            { value: "80%", label: "収益を受け取れる" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#e8eaf0" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#4a5068", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OS Cards */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Lattice OS</h2>
          <p style={{ color: "#4a5068", fontSize: 14 }}>AIに関するすべてが、ひとつの場所に</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
          {[
            { href: "/work", icon: "W", color: "#22c55e", title: "Lattice Work", badge: "NEW", desc: "AIで副業・稼ぐ環境が全部揃う" },
            { href: "/marketplace", icon: "P", color: "#6366f1", title: "プロンプトマーケット", desc: "厳選AIプロンプトを購入・販売" },
            { href: "/compare", icon: "C", color: "#f59e0b", title: "AI比較ツール", desc: "GPT・Claude・Geminiを同時比較" },
            { href: "/news", icon: "N", color: "#3b82f6", title: "AIニュース", desc: "国内外の最新AI情報をまとめて" },
            { href: "/blog", icon: "B", color: "#8b5cf6", title: "AIブログ", desc: "AI活用術・副業・最新情報" },
            { href: "/work/space", icon: "S", color: "#06b6d4", title: "Work Space", desc: "副業の進捗・収益を管理する" },
            { href: "#", icon: "M", color: "#ec4899", title: "Lattice Mind", soon: true, desc: "使うほど自分専用になるAI記憶層" },
            { href: "#", icon: "A", color: "#f97316", title: "Lattice Arena", soon: true, desc: "複数AIが議論して最良の答えを出す" },
            { href: "#", icon: "R", color: "#10b981", title: "Lattice Proof", soon: true, desc: "AI副業の実績を証明・認定バッジ" },
          ].map((card) => (
            <Link key={card.title} href={card.href} style={{ textDecoration: "none", pointerEvents: card.soon ? "none" : "auto" }}>
              <div className="os-card" style={{
                background: "#0d1120", border: "1px solid #1c2136",
                borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
                opacity: card.soon ? 0.65 : 1
              }}>
                <div style={{
                  width: 40, height: 40, background: card.color + "22", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: card.color, flexShrink: 0, border: `1px solid ${card.color}33`
                }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{card.title}</span>
                    {card.badge && <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e", background: "#052e1680", padding: "2px 6px", borderRadius: 4 }}>{card.badge}</span>}
                    {card.soon && <span className="soon-badge">近日公開</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#8b92a9" }}>{card.desc}</div>
                </div>
                {!card.soon && <div style={{ color: "#2a3050", fontSize: 14 }}>→</div>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 72px", textAlign: "center" }}>
        <div style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 16, padding: "32px 24px" }}>
          <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>毎朝8時配信</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Lattice AI Morning</h2>
          <p style={{ fontSize: 13, color: "#8b92a9", marginBottom: 24, lineHeight: 1.7 }}>
            今日のAIニュース・使えるプロンプト・AI活用ヒントを毎朝メールでお届けします。無料。
          </p>
          <form style={{ display: "flex", gap: 8 }}>
            <input type="email" placeholder="メールアドレス" style={{
              flex: 1, padding: "10px 14px", background: "#080b14",
              border: "1px solid #2a3050", borderRadius: 8, color: "#e8eaf0", fontSize: 14, outline: "none"
            }} />
            <button type="submit" style={{
              padding: "10px 20px", background: "#6366f1", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer"
            }}>無料登録</button>
          </form>
          <p style={{ fontSize: 11, color: "#4a5068", marginTop: 10 }}>いつでも解除できます</p>
        </div>
      </section>

      {/* Popular Prompts */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 72px" }}>
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
                <span style={{ fontSize: 11, color: "#22c55e" }}>{agent.price === 0 ? "無料" : `${agent.price}円`}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{agent.name}</div>
              <div style={{ fontSize: 12, color: "#8b92a9", lineHeight: 1.5, marginBottom: 12 }}>{agent.description}</div>
              <div style={{ fontSize: 11, color: "#4a5068", marginBottom: 12 }}>by {agent.authorName} · {agent.useCount}回使用</div>
              <Link href={`/apps/${agent.id}`} style={{
                display: "block", textAlign: "center", padding: "8px",
                background: "#6366f1", borderRadius: 8, color: "#fff",
                fontSize: 13, fontWeight: 700, textDecoration: "none"
              }}>実行する</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 72px" }}>
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
      <section style={{ textAlign: "center", padding: "48px 24px 88px", borderTop: "1px solid #0d1120" }}>
        <p style={{ fontSize: 13, color: "#4a5068", marginBottom: 12 }}>日本語圏のAI OS、Lattice</p>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.03em" }}>
          AIと、生きていく。
        </h2>
        <p style={{ fontSize: 14, color: "#4a5068", marginBottom: 32 }}>使うほど、あなた専用になる。</p>
        <Link href="/marketplace" className="btn-primary" style={{
          background: "#6366f1", color: "#fff", padding: "14px 36px",
          borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block"
        }}>
          Latticeを始める（無料）
        </Link>
      </section>
    </main>
  );
}