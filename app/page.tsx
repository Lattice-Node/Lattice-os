import Link from "next/link";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lattice - 自然言語で動くAIエージェント",
  description: "話しかけるだけで業務を自動化。技術知識ゼロで使えるノーコード自動化プラットフォーム。",
};

const TEMPLATES = [
  { id: "competitor-monitor", name: "競合モニタリング", description: "競合他社の動向を毎朝チェックして、変化があればアプリに通知する。", trigger: "毎朝8時", category: "リサーチ" },
  { id: "weekly-report", name: "週次レポート自動作成", description: "1週間の活動をまとめたレポートを自動で作成してメール送信。", trigger: "毎週金曜17時", category: "生産性" },
  { id: "inquiry-reply", name: "新規問い合わせ対応", description: "新しい問い合わせが来たら、内容を分析して返信文の下書きを作成。", trigger: "メール受信時", category: "営業" },
  { id: "price-alert", name: "価格変動アラート", description: "指定した商品の価格を監視して、目標価格になったら即通知。", trigger: "1時間ごと", category: "EC" },
  { id: "sns-trend", name: "SNSトレンド収集", description: "業界のトレンドを毎朝まとめて、投稿ネタとして整理する。", trigger: "毎朝7時", category: "マーケ" },
  { id: "contract-check", name: "契約書チェック", description: "送られてきた契約書を読み込み、注意すべき条項をリストアップ。", trigger: "ファイル受信時", category: "法務" },
];

const BG = "#111318";
const CARD = "#1a1d24";
const BORDER = "#2a2d35";
const TEXT = "#e8eaf0";
const MUTED = "#9096a8";
const DIM = "#4a5060";
const ACCENT = "#6c71e8";
const ACCENT_BG = "#1e2044";

export default function HomePage() {
  return (
    <>
      <style>{`
        .template-card:hover { background: #20242e !important; border-color: #363a48 !important; }
        .btn-ghost:hover { border-color: #363a48 !important; color: #c0c4d0 !important; }
        .plan-card:hover { border-color: #363a48 !important; }
      `}</style>
      <main style={{ background: BG, minHeight: "100vh", color: TEXT }}>

        {/* Hero */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 14px", borderRadius: 20,
            border: `1px solid ${BORDER}`, marginBottom: 40,
            fontSize: 12, color: MUTED, background: CARD,
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
            color: "#ffffff",
          }}>
            話しかけるだけで、<br />
            <span style={{ color: DIM }}>仕事が自動で動く。</span>
          </h1>
          <p style={{
            fontSize: 17, color: MUTED, maxWidth: 420,
            margin: "0 auto 44px", lineHeight: 1.75, letterSpacing: "-0.01em",
          }}>
            やりたいことを日本語で入力するだけ。<br />
            LatticeがAIエージェントを作って、代わりに動かします。
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{
              padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: ACCENT, color: "#fff", textDecoration: "none",
              boxShadow: "0 0 0 1px rgba(108,113,232,0.3)",
            }}>
              無料ではじめる
            </Link>
            <Link href="#how-it-works" className="btn-ghost" style={{
              padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 500,
              border: `1px solid ${BORDER}`, color: MUTED, textDecoration: "none",
              transition: "all 0.15s", background: CARD,
            }}>
              使い方を見る
            </Link>
          </div>
        </section>

        {/* Demo */}
        <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 6, background: "#1a1d2e" }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#363a48" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#363a48" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#363a48" }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: DIM, fontFamily: "monospace" }}>lattice / 新しいエージェント</span>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: 11, color: DIM, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                自動化したいことを入力
              </p>
              <div style={{
                fontSize: 15, color: TEXT, lineHeight: 1.65,
                padding: "14px 16px", background: "#1e2230",
                borderRadius: 8, border: `1px solid ${BORDER}`, minHeight: 72,
              }}>
                「毎朝、競合3社のサイトをチェックして新着情報をアプリに届けて」
              </div>
              <div style={{ marginTop: 12, padding: "16px", background: "#1e2230", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 11, color: DIM, marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  エージェント作成完了
                </p>
                {[
                  { label: "スケジュール", value: "毎朝 8:00" },
                  { label: "アクション", value: "3サイトをスキャン・差分を検出" },
                  { label: "出力先", value: "アプリ通知" },
                  { label: "ステータス", value: "稼働中", green: true },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: DIM }}>{item.label}</span>
                    <span style={{ color: item.green ? "#4ade80" : MUTED }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, color: DIM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>使い方</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", maxWidth: 400, margin: 0 }}>
              3ステップで自動化完了
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {[
              { step: "01", title: "日本語で入力する", description: "「毎朝メールを要約してアプリに届けて」のように、やりたいことをそのまま書くだけ。" },
              { step: "02", title: "AIが自動で構築する", description: "LatticeがAIエージェントを自動で組み立てます。設定・コード・API連携は全部お任せ。" },
              { step: "03", title: "あとは勝手に動く", description: "スケジュール通りに動き続けます。あなたは結果を受け取るだけ。" },
            ].map((item) => (
              <div key={item.step} style={{ padding: "32px", border: `1px solid ${BORDER}`, background: CARD, borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 16, letterSpacing: "0.05em" }}>{item.step}</p>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 10, letterSpacing: "-0.02em" }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.75, margin: 0 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: 11, color: DIM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>テンプレート</p>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
                すぐに使えるテンプレート
              </h2>
            </div>
            <Link href="/agents" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>すべて見る →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {TEMPLATES.map((t) => (
              <Link key={t.id} href={`/agents/new?template=${t.id}`} style={{ textDecoration: "none" }}>
                <div className="template-card" style={{
                  padding: "24px", border: `1px solid ${BORDER}`,
                  background: CARD, cursor: "pointer",
                  transition: "all 0.15s", borderRadius: 10,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, color: ACCENT,
                    padding: "3px 9px", borderRadius: 4, background: ACCENT_BG,
                    display: "inline-block", marginBottom: 14,
                  }}>
                    {t.category}
                  </span>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 8, letterSpacing: "-0.01em" }}>{t.name}</h3>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, marginBottom: 16 }}>{t.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: BORDER, display: "inline-block" }} />
                    <span style={{ fontSize: 12, color: DIM }}>{t.trigger}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pricing - temporarily hidden
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: DIM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>料金</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
              シンプルな料金体系
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {[
              { name: "Free", price: "無料", desc: "個人利用・試しに使う", features: ["エージェント2個まで", "100クレジット付与", "アプリ内通知"], highlight: false },
              { name: "Personal", price: "¥980", desc: "個人事業主・フリーランス", features: ["500クレジット", "エージェント10個", "アプリ内通知", "メール通知"], highlight: true },
              { name: "Business", price: "¥4,980", desc: "チーム・中小企業向け", features: ["5,000クレジット", "エージェント無制限", "全通知対応", "チーム共有", "優先サポート"], highlight: false },
            ].map((plan) => (
              <div key={plan.name} className="plan-card" style={{
                padding: "32px 28px",
                border: `1px solid ${plan.highlight ? ACCENT : BORDER}`,
                background: plan.highlight ? "#14163a" : CARD,
                borderRadius: 10, transition: "border-color 0.15s",
              }}>
                {plan.highlight && (
                  <span style={{ fontSize: 11, color: ACCENT, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 12 }}>人気</span>
                )}
                <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, margin: "0 0 8px" }}>{plan.name}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 6px" }}>{plan.price}</p>
                <p style={{ fontSize: 12, color: DIM, margin: "0 0 24px" }}>{plan.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: ACCENT, fontSize: 13 }}>✓</span>
                      <span style={{ fontSize: 13, color: MUTED }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" style={{
                  display: "block", marginTop: 28, textAlign: "center",
                  padding: "10px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  background: plan.highlight ? ACCENT : "transparent",
                  color: plan.highlight ? "#fff" : MUTED,
                  border: plan.highlight ? "none" : `1px solid ${BORDER}`,
                  textDecoration: "none",
                }}>
                  はじめる
                </Link>
              </div>
            ))}
          </div>
        </section>
        */}

        {/* CTA */}
        <section style={{ borderTop: `1px solid ${BORDER}`, padding: "100px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16 }}>
            手作業をやめて、<br /><span style={{ color: DIM }}>本業に集中しよう。</span>
          </h2>
          <p style={{ fontSize: 15, color: MUTED, marginBottom: 36 }}>クレジットカード不要。無料ではじめられます。</p>
          <Link href="/login" style={{
            display: "inline-block", padding: "13px 36px", borderRadius: 8,
            fontSize: 14, fontWeight: 600, background: "#fff", color: "#111318",
            textDecoration: "none",
          }}>
            無料ではじめる
          </Link>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "32px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#6c71e8"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#6c71e8" opacity="0.6"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#6c71e8" opacity="0.6"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#6c71e8" opacity="0.3"/>
              </svg>
              <span style={{ fontSize: 14, color: MUTED }}>Lattice</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: DIM, textDecoration: "none" }}>プライバシー</Link>
              <Link href="/terms" style={{ fontSize: 13, color: DIM, textDecoration: "none" }}>利用規約</Link>
              <Link href="https://x.com/Lattice_Node" style={{ fontSize: 13, color: DIM, textDecoration: "none" }}>X</Link>
            </div>
            <span style={{ fontSize: 13, color: "#2a2d35" }}>&copy; 2026 Lattice</span>
          </div>
        </footer>
      </main>
    </>
  );
}


