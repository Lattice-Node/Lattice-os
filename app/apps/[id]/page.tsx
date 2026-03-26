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
    title: `${agent.name} - 霎滂ｽ｡隴∝リI郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ | Lattice`,
    description: `${agent.description} ChatGPT郢晢ｽｻClaude郢晢ｽｻGemini陝・ｽｾ陟｢諛翫・霎滂ｽ｡隴∝生繝ｻ郢晢ｽｭ郢晢ｽｳ郢晏干繝ｨ郢昴・ﾎｦ郢晏干ﾎ樒ｹ晢ｽｼ郢晏現ﾂ繧・＆郢晄鱒繝ｻ邵ｺ・ｧ邵ｺ蜷ｶ・・抄・ｿ邵ｺ蛹ｻ竏ｪ邵ｺ蜷ｶﾂ・｡,
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
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>郢晏ｸ吶・郢晢｣ｰ</Link>
          <span>遯ｶ・ｺ</span>
          <Link href="/marketplace" style={{ color: "#9ca3af", textDecoration: "none" }}>郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ鬮ｮ繝ｻ/Link>
          <span>遯ｶ・ｺ</span>
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
              {agent.price === 0 ? "霎滂ｽ｡隴√・ : `・ゑｽ･${agent.price}`}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#111827", marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {agent.name}
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.8 }}>
            {agent.description}
          </p>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
            陋ｻ・ｶ闖ｴ諛ｶ・ｼ蝌ｴagent.authorName} ・ゑｽｷ {agent.useCount}陜玲ｨ費ｽｽ・ｿ騾包ｽｨ
          </div>
        </div>

        {/* Main Card */}
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "28px", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ郢ｧ雋橸ｽｮ貅ｯ・｡蠕娯・郢ｧ繝ｻ/h2>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>ChatGPT郢晢ｽｻClaude郢晢ｽｻGemini陝・ｽｾ陟｢繝ｻ/span>
          </div>

          <div id="prompt-display" style={{
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 10, padding: "16px",
            fontSize: 14, color: "#374151", lineHeight: 1.8,
            marginBottom: 16, minHeight: 80, whiteSpace: "pre-wrap"
          }}>
            {agent.prompt || agent.description}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(agent.prompt || agent.description);
                const btn = document.querySelector('.copy-btn') as HTMLButtonElement;
                if (btn) { btn.textContent = "郢ｧ・ｳ郢晄鱒繝ｻ邵ｺ蜉ｱ竏ｪ邵ｺ蜉ｱ笳・・繝ｻ; setTimeout(() => { btn.textContent = "郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ郢ｧ蛛ｵ縺慕ｹ晄鱒繝ｻ"; }, 2000); }
              }}
              style={{
                flex: 1, padding: "12px",
                background: "#6366f1", color: "#fff",
                border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}
            >
              郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ郢ｧ蛛ｵ縺慕ｹ晄鱒繝ｻ
            </button>
          </div>
        </div>

        {/* How to use */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.01em" }}>
            闖ｴ・ｿ邵ｺ繝ｻ蟀ｿ
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { step: "1", title: "郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ郢ｧ蛛ｵ縺慕ｹ晄鱒繝ｻ", desc: "闕ｳ鄙ｫ繝ｻ郢晄㈱縺｡郢晢ｽｳ邵ｺ・ｧ郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ郢ｧ蛛ｵ縺醍ｹ晢ｽｪ郢昴・繝ｻ郢晄㈱繝ｻ郢晏ｳｨ竊鍋ｹｧ・ｳ郢晄鱒繝ｻ邵ｺ蜉ｱ竏ｪ邵ｺ繝ｻ },
              { step: "2", title: "AI郢ｧ・ｵ郢晢ｽｼ郢晁侭縺帷ｸｺ・ｫ髮具ｽｼ郢ｧ雍具ｽｻ蛟･・", desc: "ChatGPT郢晢ｽｻClaude郢晢ｽｻGemini邵ｺ・ｪ邵ｺ・ｩ邵ｺ・ｮAI郢昶・ﾎ慕ｹ昴・繝ｨ邵ｺ・ｫ髮具ｽｼ郢ｧ雍具ｽｻ蛟･・邵ｺ・ｾ邵ｺ繝ｻ },
              { step: "3", title: "陟｢繝ｻ・ｦ竏壺・陟｢諛環ｧ邵ｺ・ｦ驍ｱ・ｨ鬮ｮ繝ｻ, desc: "[ ] 邵ｺ・ｧ陜暦ｽｲ邵ｺ・ｾ郢ｧ蠕娯螺鬩幢ｽｨ陋ｻ繝ｻ・帝明・ｪ陋ｻ繝ｻ繝ｻ隲繝ｻ・ｰ・ｱ邵ｺ・ｫ隴厄ｽｸ邵ｺ閧ｴ驪､邵ｺ蛹ｻ窶ｻ鬨ｾ竏ｽ・ｿ・｡邵ｺ蜉ｱ竏ｪ邵ｺ繝ｻ },
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
              陷ｷ蠕個ｧ郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ邵ｺ・ｮ郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {related.map(r => (
                <Link key={r.id} href={`/apps/${r.id}`} style={{ textDecoration: "none" }}>
                  <div className="related-card" style={{
                    background: "#fff", border: "1.5px solid #f0f0f0",
                    borderRadius: 12, padding: "16px"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 6, lineHeight: 1.4 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.useCount}陜玲ｨ費ｽｽ・ｿ騾包ｽｨ</div>
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
            遶翫・郢晏干ﾎ溽ｹ晢ｽｳ郢晏干繝ｨ鬮ｮ繝ｻ竊楢ｬ鯉ｽｻ郢ｧ繝ｻ
          </Link>
        </div>
      </div>
    </main>
  );
}