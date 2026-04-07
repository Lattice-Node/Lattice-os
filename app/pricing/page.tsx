import Link from "next/link";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン | Lattice",
  description: "Latticeの料金プランを比較。Free / Starter / Pro / Businessの4プラン。",
};

const plans = [
  {
    name: "Free",
    price: "¥0",
    priceNote: "永久無料",
    color: "var(--text-disabled)",
    bg: "var(--surface)",
    border: "var(--border)",
    features: [
      { text: "エージェント 3体", included: true },
      { text: "5クレジット / 月", included: true },
      { text: "Web検索 + AI要約", included: true },
      { text: "テンプレートストア", included: true },
      { text: "Gmail / Discord連携", included: false },
      { text: "Tool Use（自律行動）", included: false },
      { text: "AI記憶 / AI学習", included: false },
      { text: "LINE連携", included: false },
      { text: "優先サポート", included: false },
    ],
  },
  {
    name: "Starter",
    price: "¥980",
    priceNote: "/ 月",
    color: "var(--btn-bg)",
    bg: "rgba(108,113,232,0.06)",
    border: "rgba(108,113,232,0.25)",
    features: [
      { text: "エージェント 10体", included: true },
      { text: "50クレジット / 月", included: true },
      { text: "Web検索 + AI要約", included: true },
      { text: "テンプレートストア", included: true },
      { text: "Gmail / Discord連携", included: true },
      { text: "Tool Use（自律行動）", included: false },
      { text: "AI記憶 / AI学習", included: false },
      { text: "LINE連携", included: false },
      { text: "優先サポート", included: false },
    ],
  },
  {
    name: "Pro",
    price: "¥2,480",
    priceNote: "/ 月",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.25)",
    popular: true,
    features: [
      { text: "エージェント 30体", included: true },
      { text: "200クレジット / 月", included: true },
      { text: "Web検索 + AI要約", included: true },
      { text: "テンプレートストア", included: true },
      { text: "Gmail / Discord連携", included: true },
      { text: "Tool Use（自律行動）", included: true },
      { text: "AI記憶 / AI学習", included: true },
      { text: "LINE連携", included: false },
      { text: "優先サポート", included: false },
    ],
  },
  {
    name: "Business",
    price: "¥6,980",
    priceNote: "/ 月",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.25)",
    features: [
      { text: "エージェント 無制限", included: true },
      { text: "1000クレジット / 月", included: true },
      { text: "Web検索 + AI要約", included: true },
      { text: "テンプレートストア", included: true },
      { text: "Gmail / Discord連携", included: true },
      { text: "Tool Use（自律行動）", included: true },
      { text: "AI記憶 / AI学習", included: true },
      { text: "LINE連携", included: true },
      { text: "優先サポート", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
      <Nav />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 16px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: "var(--btn-bg)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>PRICING</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>シンプルな料金プラン</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto" }}>すべてのプランにWeb検索+AI要約が含まれています。いつでもアップグレード・ダウングレード可能。</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 40 }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 16, padding: "24px 18px", position: "relative" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#a855f7", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 10 }}>おすすめ</div>
              )}
              <p style={{ fontSize: 14, fontWeight: 700, color: plan.color, margin: "0 0 8px" }}>{plan.name}</p>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{plan.price}</span>
                <span style={{ fontSize: 12, color: "var(--text-disabled)", marginLeft: 4 }}>{plan.priceNote}</span>
              </div>

              <Link href="/login/" style={{ display: "block", padding: "10px", borderRadius: 8, background: plan.popular ? plan.color : "var(--surface)", border: plan.popular ? "none" : `1px solid ${plan.border}`, color: plan.popular ? "#fff" : plan.color, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center", marginBottom: 20 }}>
                {plan.price === "¥0" ? "無料で始める" : "このプランを選ぶ"}
              </Link>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f) => (
                  <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    {f.included ? (
                      <span style={{ color: plan.color, fontSize: 12, flexShrink: 0 }}>✓</span>
                    ) : (
                      <span style={{ color: "var(--border)", fontSize: 12, flexShrink: 0 }}>—</span>
                    )}
                    <span style={{ color: f.included ? "var(--text-secondary)" : "#3a3f4c" }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 24, letterSpacing: "-0.02em" }}>よくある質問</h2>
          {[
            { q: "クレジットとは？", a: "エージェントを1回実行するごとに2クレジットを消費します。クレジットは毎月リセットされます。追加購入も可能です（有料プランのみ）。" },
            { q: "プランの変更はいつでもできますか？", a: "はい。設定画面からいつでもアップグレード・ダウングレードが可能です。ダウングレードは現在の請求期間の終了時に反映されます。" },
            { q: "解約したらデータはどうなりますか？", a: "解約後もFreeプランとしてアカウントとデータは保持されます。アカウント削除をしない限りデータは消えません。" },
            { q: "支払い方法は？", a: "Stripeを通じてクレジットカードでお支払いいただけます。Visa、Mastercard、JCB、American Expressに対応しています。" },
          ].map((item) => (
            <div key={item.q} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>{item.q}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/login/" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, background: "var(--btn-bg)", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
            無料で始める
          </Link>
          <p style={{ fontSize: 12, color: "var(--text-disabled)", marginTop: 10 }}>クレジットカード不要</p>
        </div>
      </div>
    </main>
  );
}
