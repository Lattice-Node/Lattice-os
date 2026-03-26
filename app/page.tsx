import Link from "next/link";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lattice - 自然言語で動くAIエージェント",
  description: "話しかけるだけで業務を自動化。技術知識ゼロで使えるノーコード自動化プラットフォーム。",
};

const TEMPLATES = [
  { id: "1", name: "競合モニタリング", description: "競合他社の動向を毎朝チェックして、変化があればSlackに通知する。", trigger: "毎朝8時", category: "リサーチ" },
  { id: "2", name: "週次レポート自動作成", description: "1週間の活動をまとめたレポートを自動で作成してメール送信。", trigger: "毎週金曜17時", category: "生産性" },
  { id: "3", name: "新規問い合わせ対応", description: "新しい問い合わせが来たら、内容を分析して返信文の下書きを作成。", trigger: "メール受信時", category: "営業" },
  { id: "4", name: "価格変動アラート", description: "指定した商品の価格を監視して、目標価格になったら即通知。", trigger: "1時間ごと", category: "EC" },
  { id: "5", name: "SNSトレンド収集", description: "業界のトレンドを毎朝まとめて、投稿ネタとして整理する。", trigger: "毎朝7時", category: "マーケ" },
  { id: "6", name: "契約書チェック", description: "送られてきた契約書を読み込み、注意すべき条項をリストアップ。", trigger: "ファイル受信時", category: "法務" },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        .template-card:hover { background: #161616 !important; }
        .btn-ghost:hover { border-color: #333 !important; color: #aaa !important; }
      `}</style>
      <main style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>

        {/* Hero */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "140px 24px 100px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            border: "1px solid #1e1e1e", marginBottom: 36,
            fontSize: 12, color: "#555",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            パブリックベータ公開中
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            marginBottom: 24,
          }}>
            話しかけるだけで、<br />
            <span style={{ color: "#3a3a3a" }}>仕事が自動で動く。</span>
          </h1>
          <p style={{
            fontSize: 17, color: "#666", maxWidth: 420,
            margin: "0 auto 44px", lineHeight: 1.75, letterSpacing: "-0.01em",
          }}>
            やりたいことを日本語で入力するだけ。<br />
            LatticeがAIエージェントを作って、代わりに動かします。
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{
              padding: "12px 26px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: "#5b5fc7", color: "#fff", textDecoration: "none",
            }}>
              無料ではじめる
            </Link>
            <Link href="#how-it-works" className="btn-ghost" style={{
              padding: "12px 26px", borderRadius: 8, fontSize: 14, fontWeight: 500,
              border: "1px solid #1e1e1e", color: "#666", textDecoration: "none",
              transition: "all 0.15s",
            }}>
              使い方を見る
            </Link>
          </div>
        </section>

        {/* Demo */}
        <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#2a2a2a" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#2a2a2a" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#2a2a2a" }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: "#333", fontFamily: "monospace" }}>lattice / 新しいエージェント</span>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: 11, color: "#333", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                自動化したいことを入力
              </p>
              <div style={{
                fontSize: 15, color: "#ddd", lineHeight: 1.65,
                padding: "14px 16px", background: "#0a0a0a",
                borderRadius: 8, border: "1px solid #1a1a1a", minHeight: 72,
              }}>
                「毎朝、競合3社のサイトをチェックして新着情報をSlackに送って」
              </div>
              <div style={{ marginTop: 12, padding: "14px 16px", background: "#0d0d0d", borderRadius: 8, border: "1px solid #1a1a1a" }}>
                <p style={{ fontSize: 11, color: "#333", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  エージェント作成完了
                </p>
                {[
                  { label: "スケジュール", value: "毎朝 8:00" },
                  { label: "アクション", value: "3サイトをスキャン・差分を検出" },
                  { label: "出力先", value: "Slack #updates" },
                  { label: "ステータス", value: "稼働中", green: true },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "#3a3a3a" }}>{item.label}</span>
                    <span style={{ color: item.green ? "#22c55e" : "#666" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              使い方
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", maxWidth: 400, margin: 0 }}>
              3ステップで自動化完了
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}>
            {[
              { step: "01", title: "日本語で入力する", description: "「毎朝メールを要約してSlackに送って」のように、やりたいことをそのまま書くだけ。" },
              { step: "02", title: "AIが自動で構築する", description: "LatticeがAIエージェントを自動で組み立てます。設定・コード・API連携は全部お任せ。" },
              { step: "03", title: "あとは勝手に動く", description: "スケジュール通りに動き続けます。あなたは結果を受け取るだけ。" },
            ].map((item) => (
              <div key={item.step} style={{ padding: "36px", border: "1px solid #1a1a1a", background: "#111" }}>
                <p style={{ fontSize: 12, color: "#5b5fc7", fontWeight: 600, marginBottom: 18, letterSpacing: "0.05em" }}>
                  {item.step}
                </p>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 10, letterSpacing: "-0.02em" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.75, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: 11, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                テンプレート
              </p>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
                すぐに使えるテンプレート
              </h2>
            </div>
            <Link href="/agents" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>
              すべて見る →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1 }}>
            {TEMPLATES.map((t) => (
              <Link key={t.id} href="/agents/new" style={{ textDecoration: "none" }}>
                <div className="template-card" style={{ padding: "24px", border: "1px solid #1a1a1a", background: "#111", cursor: "pointer", transition: "background 0.15s" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#5b5fc7", padding: "2px 8px", borderRadius: 4, background: "#1a1b3a", display: "inline-block", marginBottom: 12 }}>
                    {t.category}
                  </span>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 8, letterSpacing: "-0.01em" }}>
                    {t.name}
                  </h3>
                  <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65, marginBottom: 16 }}>
                    {t.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2a2a2a", display: "inline-block" }} />
                    <span style={{ fontSize: 12, color: "#3a3a3a" }}>{t.trigger}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>料金</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
              シンプルな料金体系
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1 }}>
            {[
              { name: "Free", price: "無料", desc: "個人利用・試しに使う", features: ["エージェント3個まで", "月100回実行", "基本連携"] },
              { name: "Personal", price: "¥980/月", desc: "個人事業主・フリーランス", features: ["エージェント無制限", "月1,000回実行", "全連携対応", "優先サポート"], highlight: true },
              { name: "Business", price: "¥4,980/月", desc: "チーム・中小企業向け", features: ["エージェント無制限", "月10,000回実行", "全連携対応", "チーム共有", "専用サポート"] },
            ].map((plan) => (
              <div key={plan.name} style={{
                padding: "32px 28px",
                border: `1px solid ${plan.highlight ? "#5b5fc7" : "#1a1a1a"}`,
                background: plan.highlight ? "#0e0e1e" : "#111",
              }}>
                {plan.highlight && (
                  <span style={{ fontSize: 11, color: "#5b5fc7", fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 12 }}>
                    人気
                  </span>
                )}
                <p style={{ fontSize: 14, fontWeight: 600, color: "#888", margin: "0 0 8px" }}>{plan.name}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 6px" }}>{plan.price}</p>
                <p style={{ fontSize: 12, color: "#444", margin: "0 0 24px" }}>{plan.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#5b5fc7", fontSize: 13 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#666" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" style={{
                  display: "block", marginTop: 28, textAlign: "center",
                  padding: "9px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  background: plan.highlight ? "#5b5fc7" : "transparent",
                  color: plan.highlight ? "#fff" : "#555",
                  border: plan.highlight ? "none" : "1px solid #222",
                  textDecoration: "none",
                }}>
                  はじめる
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: "1px solid #1a1a1a", padding: "100px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16 }}>
            手作業をやめて、<br /><span style={{ color: "#333" }}>本業に集中しよう。</span>
          </h2>
          <p style={{ fontSize: 15, color: "#555", marginBottom: 36 }}>クレジットカード不要。無料ではじめられます。</p>
          <Link href="/login" style={{
            display: "inline-block", padding: "12px 32px", borderRadius: 8,
            fontSize: 14, fontWeight: 600, background: "#fff", color: "#0a0a0a",
            textDecoration: "none",
          }}>
            無料ではじめる
          </Link>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #1a1a1a", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.3"/>
              </svg>
              <span style={{ fontSize: 14, color: "#444" }}>Lattice</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>プライバシー</Link>
              <Link href="/terms" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>利用規約</Link>
              <Link href="https://x.com/Lattice_Node" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>X</Link>
            </div>
            <span style={{ fontSize: 13, color: "#2a2a2a" }}>&copy; 2026 Lattice</span>
          </div>
        </footer>
      </main>
    </>
  );
}