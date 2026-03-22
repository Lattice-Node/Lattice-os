import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Lattice",
  description: "Latticeのプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>プライバシーポリシー</h1>
        <p style={{ color: "#8b92a9", fontSize: 13, marginBottom: 40 }}>最終更新日：2026年3月22日</p>

        {[
          {
            title: "1. 事業者情報",
            body: "本サービス「Lattice」（以下「当サービス」）は、個人が運営するAIプロンプトマーケットプレイスです。",
          },
          {
            title: "2. 収集する情報",
            body: "当サービスでは以下の情報を収集します。\n\n・GitHubアカウント情報（ユーザー名・メールアドレス・プロフィール画像）\n・購入履歴・出品履歴\n・サービスの利用状況（Google Analyticsによるアクセス解析）",
          },
          {
            title: "3. 情報の利用目的",
            body: "収集した情報は以下の目的で利用します。\n\n・サービスの提供・運営\n・決済処理（Stripe）\n・カスタマーサポート\n・サービス改善のための分析",
          },
          {
            title: "4. 第三者への提供",
            body: "当サービスは、以下の場合を除き、収集した個人情報を第三者に提供しません。\n\n・法令に基づく場合\n・決済処理のためにStripeに提供する場合\n・ユーザーの同意がある場合",
          },
          {
            title: "5. 決済情報について",
            body: "クレジットカード情報等の決済情報は、当サービスのサーバーには保存されません。決済処理はStripe, Inc.が提供するサービスを通じて行われます。",
          },
          {
            title: "6. Cookieの使用",
            body: "当サービスでは、サービスの利用状況の分析のためにGoogle Analyticsを使用しています。Google Analyticsはデータ収集のためにCookieを使用しています。",
          },
          {
            title: "7. 個人情報の管理",
            body: "当サービスは、収集した個人情報の漏洩・不正アクセス・改ざん等を防止するため、適切なセキュリティ対策を講じます。",
          },
          {
            title: "8. お問い合わせ",
            body: "プライバシーポリシーに関するお問い合わせは、X（@Lattice_Node）のDMまでご連絡ください。",
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#e8eaf0" }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: "#8b92a9", lineHeight: 1.8, whiteSpace: "pre-line" }}>{section.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}