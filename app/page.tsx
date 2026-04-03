import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.email) {
    redirect("/agents");
  }

  // Fetch counts for social proof
  const [templateCount, communityCount] = await Promise.all([
    prisma.agentTemplate.count(),
    prisma.userAgent.count({ where: { isPublic: true } }),
  ]);

  return (
    <main style={{ minHeight: "100dvh", background: "#0e1117", color: "#e8eaf0" }}>
      {/* Top Nav */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 56,
        borderBottom: "1px solid #1c2028",
        background: "rgba(14,17,23,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#6c71e8", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>Lattice</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/store" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#9096a8", textDecoration: "none" }}>ストア</Link>
            <Link href="/pricing" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#9096a8", textDecoration: "none" }}>料金</Link>
            <Link href="/login" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#6c71e8", color: "#fff", textDecoration: "none", marginLeft: 4 }}>始める</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 60, textAlign: "center", padding: "120px 20px 60px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(108,113,232,0.10)", border: "1px solid rgba(108,113,232,0.20)", marginBottom: 24, fontSize: 12, color: "#6c71e8", fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
            {templateCount + communityCount}個のエージェントが稼働中
          </div>
          <h1 style={{ fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
            話しかけるだけで、<br />
            <span style={{ color: "#6c71e8" }}>業務が動く。</span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 3.5vw, 18px)", color: "#9096a8", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            AIエージェントがあなたの代わりにリサーチ、要約、通知、メール送信。
            技術知識ゼロ、ノーコードで自動化。
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ padding: "14px 28px", borderRadius: 10, background: "#6c71e8", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              無料で始める
            </Link>
            <Link href="/store" style={{ padding: "14px 28px", borderRadius: 10, background: "#1c2028", border: "1px solid #2e3440", color: "#e8eaf0", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
              ストアを見る →
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "#4a5060", marginTop: 14 }}>クレジットカード不要・Freeプランあり</p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "40px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "#6c71e8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>使い方</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: 36, color: "#e8eaf0" }}>3ステップで完了</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { step: "1", title: "テンプレを選ぶ", desc: "ストアから業務に合ったエージェントを選択。カスタマイズも簡単。", icon: "📋" },
            { step: "2", title: "日本語で指示", desc: "「毎朝AIニュースを要約して」「競合の価格を監視して」など自然言語でOK。", icon: "💬" },
            { step: "3", title: "自動で実行", desc: "スケジュール設定すれば毎日自動実行。結果はアプリ・メール・Discordに届く。", icon: "⚡" },
          ].map((item) => (
            <div key={item.step} style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 14, padding: "24px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: "#6c71e8", fontWeight: 700, marginBottom: 6 }}>STEP {item.step}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#e8eaf0" }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "#6a7080", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "40px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>特徴</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: 36, color: "#e8eaf0" }}>できること</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { title: "Web検索 + AI要約", desc: "最新情報を検索し、AIが読みやすく要約。毎日の情報収集を自動化。", color: "#6c71e8" },
            { title: "Tool Use（自律行動）", desc: "Webページ読み込み、メール送信など、AIが自分で判断して複数ステップを実行。", color: "#a855f7" },
            { title: "Gmail / Discord連携", desc: "結果をメールやDiscordに自動送信。チームへの共有もワンタップ。", color: "#4ade80" },
            { title: "スケジュール実行", desc: "毎日・毎週の定期実行。一度設定すれば放置でOK。", color: "#f59e0b" },
            { title: "テンプレートストア", desc: "公式 + コミュニティのテンプレートから選んですぐ使える。", color: "#6c71e8" },
            { title: "コミュニティ共有", desc: "自作エージェントを公開。みんなのエージェントをコピーして使える。", color: "#4ade80" },
          ].map((f) => (
            <div key={f.title} style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "20px 18px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, marginBottom: 12 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px", color: "#e8eaf0" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#6a7080", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "40px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>料金プラン</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: 36, color: "#e8eaf0" }}>シンプルな料金体系</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { name: "Free", price: "¥0", features: ["エージェント3体", "5cr/月", "Web検索+AI要約"], color: "#4a5060", bg: "#1c2028", border: "#2e3440" },
            { name: "Starter", price: "¥980", features: ["エージェント10体", "50cr/月", "+Gmail/Discord連携"], color: "#6c71e8", bg: "rgba(108,113,232,0.06)", border: "rgba(108,113,232,0.25)" },
            { name: "Pro", price: "¥2,480", features: ["エージェント30体", "200cr/月", "+Tool Use", "+AI記憶/学習"], color: "#a855f7", bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.25)", popular: true },
            { name: "Business", price: "¥6,980", features: ["無制限", "1000cr/月", "+LINE連携", "+優先サポート"], color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.25)" },
          ].map((p) => (
            <div key={p.name} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 14, padding: "22px 16px", position: "relative" }}>
              {p.popular && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#a855f7", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 10 }}>人気</div>
              )}
              <p style={{ fontSize: 13, fontWeight: 700, color: p.color, margin: "0 0 4px" }}>{p.name}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#e8eaf0", margin: "0 0 4px", letterSpacing: "-0.03em" }}>{p.price}</p>
              <p style={{ fontSize: 11, color: "#4a5060", margin: "0 0 14px" }}>/月</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ fontSize: 12, color: "#9096a8", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: p.color, fontSize: 10 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/pricing" style={{ fontSize: 13, color: "#6c71e8", textDecoration: "none" }}>
            プランの詳細を比較する →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "40px 20px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 440, margin: "0 auto", background: "rgba(108,113,232,0.06)", border: "1px solid rgba(108,113,232,0.15)", borderRadius: 16, padding: "36px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10, color: "#e8eaf0" }}>今すぐ始めよう</h2>
          <p style={{ fontSize: 14, color: "#6a7080", lineHeight: 1.6, marginBottom: 24 }}>アカウント作成は30秒。Freeプランでまずは試してみてください。</p>
          <Link href="/login" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, background: "#6c71e8", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
            無料で始める
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1c2028", padding: "24px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
          <Link href="/terms" style={{ fontSize: 12, color: "#4a5060", textDecoration: "none" }}>利用規約</Link>
          <Link href="/privacy" style={{ fontSize: 12, color: "#4a5060", textDecoration: "none" }}>プライバシー</Link>
          <Link href="/pricing" style={{ fontSize: 12, color: "#4a5060", textDecoration: "none" }}>料金</Link>
          <a href="https://twitter.com/Lattice_Node" target="_blank" rel="noopener" style={{ fontSize: 12, color: "#4a5060", textDecoration: "none" }}>X (Twitter)</a>
        </div>
        <p style={{ fontSize: 11, color: "#2e3440", margin: 0 }}>© 2026 Lattice Node</p>
      </footer>
    </main>
  );
}
