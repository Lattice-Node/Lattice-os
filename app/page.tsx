import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lattice - 日本語AIのOS | ChatGPTプロンプト・AI副業・AI比較",
  description: "日本人がAIを使い始める場所。ChatGPTプロンプト無料テンプレート・AI副業スペース・複数AI同時比較。使うほど自分専用になる日本のAIインフラ。",
  keywords: ["ChatGPTプロンプト", "AIプロンプト 無料", "AI副業", "ChatGPT比較", "AIツール", "日本語AI"],
  openGraph: {
    title: "Lattice - 日本語AIのOS",
    description: "日本人がAIを使い始め、使い続けるための場所。",
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
    <main style={{ minHeight: "100vh", background: "#060910", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`
        .os-card { transition: border-color 0.15s, transform 0.15s; }
        .os-card:hover { border-color: #6366f155 !important; transform: translateY(-2px); }
        .prompt-card { transition: border-color 0.15s; }
        .prompt-card:hover { border-color: #6366f155 !important; }
        .blog-card { transition: border-color 0.15s; }
        .blog-card:hover { border-color: #6366f155 !important; }
        .phase-card { transition: border-color 0.15s, background 0.15s; }
        .phase-card:hover { border-color: #6366f155 !important; background: #0d1120 !important; }
      `}</style>
      <Nav />

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "96px 24px 72px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          color: "#6366f1", background: "#1e1b4b60",
          border: "1px solid #3730a360", padding: "5px 16px",
          borderRadius: 20, marginBottom: 28
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }}></span>
          日本語AIのOS — Lattice
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900,
          lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24
        }}>
          AIを使うなら、<br />
          <span style={{ color: "#6366f1" }}>全部Latticeで。</span>
        </h1>

        <p style={{
          fontSize: 17, color: "#8b92a9", lineHeight: 1.9,
          marginBottom: 40, maxWidth: 560, margin: "0 auto 40px"
        }}>
          使えば使うほど自分専用になる。<br />
          日本人がAIと共に生きるためのインフラ。
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/marketplace" style={{
            background: "#6366f1", color: "#fff", padding: "14px 32px",
            borderRadius: 10, fontWeight: 700, fontSize: 15,
            textDecoration: "none", letterSpacing: "-0.01em"
          }}>
            無料で始める
          </Link>
          <Link href="/compare" style={{
            background: "transparent", color: "#e8eaf0",
            padding: "14px 32px", borderRadius: 10, fontWeight: 700,
            fontSize: 15, textDecoration: "none",
            border: "1px solid #2a3050"
          }}>
            AIを比較する
          </Link>
        </div>

        <div style={{
          display: "flex", gap: 40, justifyContent: "center",
          marginTop: 56, paddingTop: 40, borderTop: "1px solid #1c2136"
        }}>
          {[
            { value: `${totalAgents}+`, label: "無料プロンプト" },
            { value: `${totalUses._sum.useCount ?? 0}`, label: "実行回数" },
            { value: "80%", label: "出品者の取り分" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#e8eaf0", letterSpacing: "-0.02em" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#4a5068", marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          background: "linear-gradient(135deg, #0d1120 0%, #111827 100%)",
          border: "1px solid #1c2136", borderRadius: 20, padding: "48px 40px"
        }}>
          <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 16 }}>
            LATTICE VISION
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.3 }}>
            「AIを使うなら、全部Latticeで。」
          </h2>
          <p style={{ color: "#8b92a9", fontSize: 15, lineHeight: 1.9, maxWidth: 640, marginBottom: 40 }}>
            ChatGPT・Gemini・Claudeがバラバラに存在する今、日本人がAIを使い始める場所・使い続ける場所がない。
            Latticeはその空白を埋める。プロンプトマーケットから始まり、AI記憶・AI議会・AI認定へ。
            使えば使うほど自分専用になる、日本語AIのインフラになる。
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {[
              {
                phase: "今",
                title: "Lattice Core",
                desc: "プロンプト・比較・副業・ニュース",
                color: "#22c55e",
                status: "稼働中"
              },
              {
                phase: "3ヶ月後",
                title: "Lattice Proof",
                desc: "AI副業実績の認定・証明バッジ",
                color: "#6366f1",
                status: "開発中"
              },
              {
                phase: "6ヶ月後",
                title: "Lattice Arena",
                desc: "複数AIが反論し合う議会モード",
                color: "#f59e0b",
                status: "設計中"
              },
              {
                phase: "1年後",
                title: "Lattice Mind",
                desc: "使うほど自分専用になるAI記憶層",
                color: "#ec4899",
                status: "構想中"
              },
            ].map((item) => (
              <div key={item.title} className="phase-card" style={{
                background: "#080b14", border: "1px solid #1c2136",
                borderRadius: 12, padding: "20px"
              }}>
                <div style={{ fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
                  {item.phase} — {item.status}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#8b92a9", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OS Cards */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.02em" }}>全機能</h2>
          <p style={{ fontSize: 13, color: "#8b92a9" }}>AIに関するすべてが、ひとつの場所に</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {[
            { href: "/work", icon: "work", title: "Lattice Work", badge: "NEW", desc: "AIで副業・稼ぐ環境が全部揃う" },
            { href: "/marketplace", icon: "market", title: "プロンプトマーケット", desc: "無料から使えるAIプロンプト集" },
            { href: "/compare", icon: "compare", title: "AI比較ツール", desc: "GPT・Claude・Geminiを同時比較" },
            { href: "/news", icon: "news", title: "AIニュース", desc: "国内外の最新AI情報をまとめて" },
            { href: "/blog", icon: "blog", title: "AIブログ", desc: "AI活用術・副業・最新情報" },
            { href: "/work/space", icon: "space", title: "Work Space", desc: "副業の進捗・収益を管理する" },
          ].map((card) => (
            <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
              <div className="os-card" style={{
                background: "#0d1120", border: "1px solid #1c2136",
                borderRadius: 12, padding: "20px",
                display: "flex", alignItems: "center", gap: 16
              }}>
                <div style={{
                  width: 44, height: 44, background: "#1c2136",
                  borderRadius: 10, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                  fontSize: 11, color: "#6366f1", fontWeight: 800, letterSpacing: "0.05em"
                }}>
                  {card.icon.slice(0, 3).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{card.title}</span>
                    {card.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: "#22c55e",
                        background: "#052e1680", padding: "2px 7px", borderRadius: 4
                      }}>
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#8b92a9" }}>{card.desc}</div>
                </div>
                <div style={{ color: "#2a3050", fontSize: 18 }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 80px", textAlign: "center" }}>
        <div style={{
          background: "#0d1120", border: "1px solid #1c2136",
          borderRadius: 20, padding: "40px 32px"
        }}>
          <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 14 }}>
            毎朝8時配信
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Lattice AI Morning
          </h2>
          <p style={{ fontSize: 13, color: "#8b92a9", marginBottom: 28, lineHeight: 1.8 }}>
            今日のAIニュース・使えるプロンプト・AI活用ヒントを<br />毎朝メールでお届け。無料。
          </p>
          <form style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              placeholder="メールアドレス"
              style={{
                flex: 1, padding: "11px 16px", background: "#080b14",
                border: "1px solid #2a3050", borderRadius: 8,
                color: "#e8eaf0", fontSize: 14, outline: "none"
              }}
            />
            <button type="submit" style={{
              padding: "11px 22px", background: "#6366f1", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 14,
              fontWeight: 700, cursor: "pointer"
            }}>
              登録
            </button>
          </form>
          <p style={{ fontSize: 11, color: "#4a5068", marginTop: 12 }}>いつでも解除できます</p>
        </div>
      </section>

      {/* Popular Prompts */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: "-0.02em" }}>人気のプロンプト</h2>
            <p style={{ fontSize: 13, color: "#8b92a9" }}>コピペですぐ使える</p>
          </div>
          <Link href="/marketplace" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>すべて見る →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {agents.map((agent) => (
            <div key={agent.id} className="prompt-card" style={{
              background: "#0d1120", border: "1px solid #1c2136",
              borderRadius: 12, padding: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{agent.category}</span>
                <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                  {agent.price === 0 ? "無料" : `¥${agent.price}`}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{agent.name}</div>
              <div style={{ fontSize: 12, color: "#8b92a9", lineHeight: 1.6, marginBottom: 14 }}>{agent.description}</div>
              <div style={{ fontSize: 11, color: "#4a5068", marginBottom: 14 }}>
                by {agent.authorName} · {agent.useCount}回使用
              </div>
              <Link href={`/apps/${agent.id}`} style={{
                display: "block", textAlign: "center", padding: "9px",
                background: "#6366f1", borderRadius: 8, color: "#fff",
                fontSize: 13, fontWeight: 700, textDecoration: "none"
              }}>
                実行する
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: "-0.02em" }}>最新記事</h2>
            <p style={{ fontSize: 13, color: "#8b92a9" }}>AI活用術・副業・最新情報</p>
          </div>
          <Link href="/blog" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>すべて見る →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div className="blog-card" style={{
                background: "#0d1120", border: "1px solid #1c2136",
                borderRadius: 12, padding: "24px",
                height: "100%", boxSizing: "border-box"
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0", marginBottom: 10, lineHeight: 1.45 }}>
                  {post.title}
                </div>
                <div style={{ fontSize: 12, color: "#8b92a9", lineHeight: 1.7, marginBottom: 14 }}>
                  {post.description}
                </div>
                <div style={{ fontSize: 11, color: "#4a5068" }}>
                  {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ textAlign: "center", padding: "40px 24px 100px" }}>
        <p style={{ fontSize: 12, color: "#4a5068", marginBottom: 10, letterSpacing: "0.05em" }}>
          AI時代のインフラへ、ようこそ
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 28, letterSpacing: "-0.02em" }}>
          副業・比較・情報・ツール。<br />全部、Latticeで。
        </h2>
        <Link href="/marketplace" style={{
          background: "#6366f1", color: "#fff", padding: "14px 36px",
          borderRadius: 10, fontWeight: 700, fontSize: 15,
          textDecoration: "none", display: "inline-block"
        }}>
          無料で始める
        </Link>
      </section>
    </main>
  );
}