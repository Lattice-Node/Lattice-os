"use client";

import { useRouter } from "next/navigation";

export default function TokushohoPage() {
  const router = useRouter();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "calc(24px + env(safe-area-inset-top, 0px)) 20px 24px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          戻る
        </button>

        <p style={labelStyle}>LEGAL</p>
        <h1 style={h1Style}>特定商取引法に基づく表記</h1>
        <p style={updatedStyle}>最終更新日: 2026年4月11日</p>

        <dl style={{ margin: 0 }}>
          <Row dt="販売事業者" dd="河内 学（屋号: Lattice Node）" />
          <Row dt="運営責任者" dd="河内 学" />
          <Row dt="所在地" dd="請求があり次第、遅滞なく開示いたします。下記のメールアドレスまでご連絡ください。" />
          <Row dt="電話番号" dd="請求があり次第、遅滞なく開示いたします。下記のメールアドレスまでご連絡ください。" />
          <Row dt="メールアドレス" dd={<a href="mailto:support@lattice-protocol.com" style={{ color: "var(--accent)", textDecoration: "none" }}>support@lattice-protocol.com</a>} />
          <Row dt="サービス名" dd="Lattice" />
          <Row dt="販売価格" dd={
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ padding: "3px 0" }}>Free プラン: 無料</li>
              <li style={{ padding: "3px 0" }}>Starter プラン: 月額 ¥980（税込）</li>
              <li style={{ padding: "3px 0" }}>Pro プラン: 月額 ¥2,480（税込）</li>
            </ul>
          } />
          <Row dt="商品代金以外の必要料金" dd="なし" />
          <Row dt="お支払い方法" dd="Apple ID（App Store 経由の In-App Purchase）" />
          <Row dt="お支払い時期" dd="初回購入時、および毎月の自動更新時に課金されます。" />
          <Row dt="商品の引渡時期" dd="決済完了後、即時にサービス利用が可能となります。" />
          <Row dt="サブスクリプションの自動更新" dd="サブスクリプションは、解約手続きを行わない限り、契約期間終了時に自動的に更新されます。次回更新日の24時間前までに解約手続きを行うことで、自動更新を停止できます。" />
          <Row dt="解約方法" dd="iPhone の「設定」→「Apple ID」→「サブスクリプション」より、いつでも解約手続きを行うことができます。解約後は、現在の契約期間終了まで引き続きサービスをご利用いただけます。" />
          <Row dt="返品・キャンセルについて" dd={
            <>デジタルサービスの性質上、購入後の返品・返金は原則として承っておりません。返金につきましては、Apple のポリシーに準じます。詳細は <a href="https://reportaproblem.apple.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>reportaproblem.apple.com</a> をご確認ください。</>
          } />
          <Row dt="動作環境" dd="iOS 16 以降を推奨" />
        </dl>
      </div>
    </main>
  );
}

function Row({ dt, dd }: { dt: string; dd: React.ReactNode }) {
  return (
    <>
      <dt style={{ fontWeight: 600, color: "var(--text-display)", marginTop: 24, marginBottom: 6, fontSize: 13 }}>{dt}</dt>
      <dd style={{ margin: 0, paddingBottom: 10, color: "var(--text-primary)", borderBottom: "1px solid var(--border)", fontSize: 14, lineHeight: 1.8 }}>{dd}</dd>
    </>
  );
}

const labelStyle: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" };
const h1Style: React.CSSProperties = { fontSize: 28, fontWeight: 700, color: "var(--text-display)", margin: "0 0 6px", letterSpacing: "-0.02em" };
const updatedStyle: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--text-secondary)", margin: "0 0 32px" };
