import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "辟｡譁僊I繝・・繝ｫ髮・・ChatGPT繝励Ο繝ｳ繝励ヨ繝・Φ繝励Ξ繝ｼ繝・| Lattice",
  description: "繧ｳ繝斐・縺ｧ縺吶＄菴ｿ縺医ｋAI繝励Ο繝ｳ繝励ヨ31遞ｮ鬘樔ｻ･荳翫ゅン繧ｸ繝阪せ譁・嶌繝ｻ繝｡繝ｼ繝ｫ繝ｻ莨∫判譖ｸ繝ｻ蜑ｯ讌ｭ繝ｻ豕募ｾ九・蛹ｻ逋ゅ↑縺ｩ蟷・ｺ・＞繧ｸ繝｣繝ｳ繝ｫ縺ｫ蟇ｾ蠢懊・hatGPT繝ｻClaude繝ｻGemini蟇ｾ蠢懊ゅ☆縺ｹ縺ｦ辟｡譁吶・,
  keywords: ["ChatGPT繝励Ο繝ｳ繝励ヨ", "AI繝励Ο繝ｳ繝励ヨ 辟｡譁・, "繝励Ο繝ｳ繝励ヨ 繝・Φ繝励Ξ繝ｼ繝・, "ChatGPT 菴ｿ縺・婿", "AI 莉穂ｺ句柑邇・喧", "繝励Ο繝ｳ繝励ヨ髮・],
  openGraph: {
    title: "辟｡譁僊I繝・・繝ｫ髮・・ChatGPT繝励Ο繝ｳ繝励ヨ繝・Φ繝励Ξ繝ｼ繝・| Lattice",
    description: "繧ｳ繝斐・縺ｧ縺吶＄菴ｿ縺医ｋAI繝励Ο繝ｳ繝励ヨ31遞ｮ鬘樔ｻ･荳翫ゅ☆縺ｹ縺ｦ辟｡譁吶・,
    url: "https://lattice-protocol.com/marketplace",
    type: "website",
  },
  alternates: { canonical: "https://lattice-protocol.com/marketplace" },
};

export const revalidate = 3600;

const CATEGORY_MAP: Record<string, string> = {
  "縺吶∋縺ｦ": "縺吶∋縺ｦ",
  "Writing": "譁・ｫ繝ｻ繝ｩ繧､繝・ぅ繝ｳ繧ｰ",
  "Business": "繝薙ず繝阪せ繝ｻ莉穂ｺ・,
  "Code": "繧ｳ繝ｼ繝峨・髢狗匱",
  "Research": "隱ｿ譟ｻ繝ｻ繝ｪ繧ｵ繝ｼ繝・,
  "Finance": "雋｡蜍吶・邨檎炊",
  "Legal": "豕募ｾ九・螂醍ｴ・,
  "Medical": "蛹ｻ逋ゅ・蛛･蠎ｷ",
  "Custom": "縺昴・莉・,
};

export default async function MarketplacePage() {
  const agents = await prisma.agent.findMany({
    orderBy: { useCount: "desc" },
  });

  const categories = ["縺吶∋縺ｦ", "Writing", "Business", "Code", "Research", "Finance", "Legal", "Medical", "Custom"];
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
            縺吶∋縺ｦ辟｡譁・ﾂｷ {totalFree}遞ｮ鬘樔ｻ･荳・
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            繧ｳ繝斐・縺ｧ菴ｿ縺医ｋAI繝励Ο繝ｳ繝励ヨ髮・
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.8, marginBottom: 0, maxWidth: 560, margin: "0 auto" }}>
            ChatGPT繝ｻClaude繝ｻGemini蟇ｾ蠢懊ゆｻ穂ｺ九・蜑ｯ讌ｭ繝ｻ譌･蟶ｸ逕滓ｴｻ縺ｧ菴ｿ縺医ｋ繝・Φ繝励Ξ繝ｼ繝医ｒ辟｡譁吝・髢九・br />
            縺昴・縺ｾ縺ｾLattice縺ｧ螳溯｡後ｂ縺ｧ縺阪∪縺吶・
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Search */}
        <div style={{ marginBottom: 28 }}>
          <input
            type="search"
            placeholder="繝励Ο繝ｳ繝励ヨ繧呈､懃ｴ｢..."
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
              background: cat === "縺吶∋縺ｦ" ? "#6366f1" : "#fff",
              color: cat === "縺吶∋縺ｦ" ? "#fff" : "#4b5563",
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
            { label: "蜈ｬ髢倶ｸｭ縺ｮ繝・・繝ｫ", value: `${agents.length}遞ｮ鬘杼 },
            { label: "辟｡譁吶〒菴ｿ縺医ｋ", value: `${totalFree}遞ｮ鬘杼 },
            { label: "蟇ｾ蠢廣I", value: "ChatGPT繝ｻClaude繝ｻGemini" },
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
                  {agent.price === 0 ? "辟｡譁・ : `ﾂ･${agent.price}`}
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
                {agent.useCount > 0 ? `${agent.useCount}蝗樔ｽｿ逕ｨ` : "譁ｰ逹"} ﾂｷ {agent.authorName}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="copy-btn" style={{
                  flex: 1, padding: "10px",
                  background: "#f9fafb", border: "1.5px solid #e5e7eb",
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  color: "#4b5563", cursor: "pointer"
                }}>
                  繧ｳ繝斐・
                </button>
                <Link href={`/apps/${agent.id}`} className="run-btn" style={{
                  flex: 2, padding: "10px",
                  background: "#6366f1", borderRadius: 8,
                  fontSize: 13, fontWeight: 700,
                  color: "#fff", textDecoration: "none",
                  textAlign: "center", display: "block"
                }}>
                  Lattice縺ｧ螳溯｡後☆繧・竊・
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SEO Footer Text */}
        <section style={{ marginTop: 72, padding: "40px", background: "#f9fafb", borderRadius: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 16, letterSpacing: "-0.02em" }}>
            ChatGPT繝励Ο繝ｳ繝励ヨ縺ｨ縺ｯ・滉ｽｿ縺・婿繧ｬ繧､繝・
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.9, maxWidth: 720 }}>
            繝励Ο繝ｳ繝励ヨ縺ｨ縺ｯ縲、I縺ｫ荳弱∴繧区欠遉ｺ譁・・縺薙→縺ｧ縺吶ょ酔縺倩ｳｪ蝠上〒繧ゅ√・繝ｭ繝ｳ繝励ヨ縺ｮ譖ｸ縺肴婿繧貞ｷ･螟ｫ縺吶ｋ縺縺代〒縲、I縺ｮ蝗樒ｭ斐・雉ｪ縺悟､ｧ縺阪￥螟峨ｏ繧翫∪縺吶・
            Lattice縺ｮ繝励Ο繝ｳ繝励ヨ髮・・縲∽ｻ穂ｺ九・蜑ｯ讌ｭ繝ｻ譌･蟶ｸ逕滓ｴｻ縺ｧ菴ｿ縺医ｋ繝・Φ繝励Ξ繝ｼ繝医ｒ繧ｳ繝斐・縺ｧ縺吶＄縺ｫ菴ｿ縺医ｋ繧医≧謨ｴ逅・＠縺ｦ縺・∪縺吶・
            ChatGPT繝ｻClaude繝ｻGemini縺ｪ縺ｩ荳ｻ隕√↑AI繧ｵ繝ｼ繝薙せ縺吶∋縺ｦ縺ｫ蟇ｾ蠢懊＠縺ｦ縺翫ｊ縲∫匳骭ｲ荳崎ｦ√〒辟｡譁吶〒縺泌茜逕ｨ縺・◆縺縺代∪縺吶・
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 24 }}>
            {[
              { title: "繝薙ず繝阪せ譁・嶌菴懈・", desc: "謠先｡域嶌繝ｻ隴ｰ莠矩鹸繝ｻ繝｡繝ｼ繝ｫ繧但I縺ｧ閾ｪ蜍慕函謌・ },
              { title: "蜑ｯ讌ｭ繝ｻ繝輔Μ繝ｼ繝ｩ繝ｳ繧ｹ", desc: "蝟ｶ讌ｭ譁・・繝昴・繝医ヵ繧ｩ繝ｪ繧ｪ繝ｻ隲区ｱよ嶌" },
              { title: "繧ｳ繝ｼ繝峨・髢狗匱", desc: "繝舌げ菫ｮ豁｣繝ｻ繧ｳ繝ｼ繝峨Ξ繝薙Η繝ｼ繝ｻ險ｭ險・ },
              { title: "隱ｿ譟ｻ繝ｻ繝ｪ繧ｵ繝ｼ繝・, desc: "蟶ょｴ隱ｿ譟ｻ繝ｻ遶ｶ蜷亥・譫舌・隕∫ｴ・ },
              { title: "豕募ｾ九・螂醍ｴ・, desc: "螂醍ｴ・嶌繝√ぉ繝・け繝ｻ豕慕噪譁・嶌菴懈・" },
              { title: "蛹ｻ逋ゅ・蛛･蠎ｷ", desc: "逞・憾隱ｬ譏弱・蛹ｻ逋よュ蝣ｱ縺ｮ謨ｴ逅・ },
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