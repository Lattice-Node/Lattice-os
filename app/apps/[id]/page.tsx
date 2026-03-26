import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const agent = await prisma.agent.findUnique({ where: { id: params.id } });
  if (!agent) return { title: "Not Found" };
  return {
    title: `${agent.name} - 無料AIプロンプト | Lattice`,
    description: `${agent.description} ChatGPT・Claude・Gemini対応の無料プロンプトテンプレート。コピペですぐ使えます。`,
    keywords: [agent.name, agent.category, "ChatGPTプロンプト", "AIプロンプト 無料", "プロンプト テンプレート"],
    openGraph: {
      title: `${agent.name} | Lattice`,
      description: agent.description,
      url: `https://lattice-protocol.com/apps/${params.id}`,
    },
    alternates: { canonical: `https://lattice-protocol.com/apps/${params.id}` },
  };
}

export default async function AppPage({ params }: { params: { id: string } }) {
  const agent = await prisma.agent.findUnique({ where: { id: params.id } });
  if (!agent) notFound();

  const related = await prisma.agent.findMany({
    where: { category: agent.category, NOT: { id: agent.id } },
    take: 3,
    orderBy: { useCount: "desc" },
  });

  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: "#111827", fontFamily: "'DM Sans', 'Hiragino Sans', 'Yu Gothic', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .copy-btn { transition: all 0.15s; }
        .copy-btn:hover { background: #4f46e5 !important; }
        .related-card { transition: box-shadow 0.2s, transform 0.2s; }
        .related-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
      `}</style>
      <Nav />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "#9ca3af" }}>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>ホーム</Link>
          <span>›</span>
          <Link href="/marketplace" style={{ color: "#9ca3af", textDecoration: "none" }}>プロンプト集</Link>
          <span>›</span>
          <span style={{ color: "#6b7280" }}>{agent.name}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: "#6366f1",
              background: "#ede9fe", padding: "4px 12px", borderRadius: 20
            }}>
              {agent.category}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: agent.price === 0 ? "#10b981" : "#f59e0b",
              background: agent.price === 0 ? "#d1fae5" : "#fef3c7",
              padding: "4px 12px", borderRadius: 20
            }}>
              {agent.price === 0 ? "無料" : `¥${agent.price}`}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#111827", marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {agent.name}
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.8 }}>
            {agent.description}
          </p>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
            制作：{agent.authorName} · {agent.useCount}回使用
          </div>
        </div>

        {/* Main Card */}
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "28px", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>プロンプトを実行する</h2>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>ChatGPT・Claude・Gemini対応</span>
          </div>

          <div id="prompt-display" style={{
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 10, padding: "16px",
            fontSize: 14, color: "#374151", lineHeight: 1.8,
            marginBottom: 16, minHeight: 80, whiteSpace: "pre-wrap"
          }}>
            {agent.systemPrompt || agent.description}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(agent.systemPrompt || agent.description);
                const btn = document.querySelector('.copy-btn') as HTMLButtonElement;
                if (btn) { btn.textContent = "コピーしました！"; setTimeout(() => { btn.textContent = "プロンプトをコピー"; }, 2000); }
              }}
              style={{
                flex: 1, padding: "12px",
                background: "#6366f1", color: "#fff",
                border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}
            >
              プロンプトをコピー
            </button>
          </div>
        </div>

        {/* How to use */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.01em" }}>
            使い方
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { step: "1", title: "プロンプトをコピー", desc: "上のボタンでプロンプトをクリップボードにコピーします" },
              { step: "2", title: "AIサービスに貼り付け", desc: "ChatGPT・Claude・GeminiなどのAIチャットに貼り付けます" },
              { step: "3", title: "必要に応じて編集", desc: "[ ] で囲まれた部分を自分の情報に書き換えて送信します" },
            ].map(item => (
              <div key={item.step} style={{
                display: "flex", gap: 16, alignItems: "flex-start",
                padding: "16px", background: "#f9fafb",
                borderRadius: 10, border: "1px solid #f3f4f6"
              }}>
                <div style={{
                  width: 32, height: 32, background: "#6366f1",
                  borderRadius: 8, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fff",
                  fontSize: 14, fontWeight: 800, flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.01em" }}>
              同じカテゴリのプロンプト
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {related.map(r => (
                <Link key={r.id} href={`/apps/${r.id}`} style={{ textDecoration: "none" }}>
                  <div className="related-card" style={{
                    background: "#fff", border: "1.5px solid #f0f0f0",
                    borderRadius: 12, padding: "16px"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 6, lineHeight: 1.4 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.useCount}回使用</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link href="/marketplace" style={{
            fontSize: 14, color: "#6366f1", textDecoration: "none", fontWeight: 600
          }}>
            ← プロンプト集に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}