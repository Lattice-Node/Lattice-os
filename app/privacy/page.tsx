"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "var(--text-primary)",
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "calc(24px + env(safe-area-inset-top, 0px)) 20px 24px" }}>
        {/* Back nav */}
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            padding: "8px 0",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          戻る
        </button>

        <p style={labelStyle}>LEGAL</p>
        <h1 style={h1Style}>プライバシーポリシー</h1>
        <p style={updatedStyle}>最終更新日: 2026年4月8日</p>

        <Section number="1" title="はじめに">
          <p style={pStyle}>
            Lattice（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報を適切に
            取り扱います。本ポリシーでは、当サービスがどのような情報を収集し、どのように
            使用するかを説明します。
          </p>
        </Section>

        <Section number="2" title="収集する情報">
          <p style={{ ...pStyle, fontWeight: 600, color: "var(--text-display)" }}>ユーザーが提供する情報</p>
          <ul style={ulStyle}>
            <li>アカウント情報（Google または Apple アカウント経由のメールアドレス、表示名）</li>
            <li>AIエージェントの設定および実行履歴</li>
            <li>アプリ内で作成・送信したメッセージやコンテンツ</li>
          </ul>
          <p style={{ ...pStyle, fontWeight: 600, color: "var(--text-display)" }}>自動的に収集される情報</p>
          <ul style={ulStyle}>
            <li>アプリの利用状況（実行回数、機能の使用頻度）</li>
            <li>デバイス情報（OSバージョン、デバイスタイプ）</li>
            <li>エラーログおよびクラッシュレポート</li>
          </ul>
        </Section>

        <Section number="3" title="情報の使用目的">
          <p style={pStyle}>収集した情報は以下の目的で使用されます。</p>
          <ul style={ulStyle}>
            <li>サービスの提供および改善</li>
            <li>AIエージェントの実行</li>
            <li>ユーザーサポート</li>
            <li>サービスの安全性確保（不正利用の検出）</li>
            <li>法令遵守</li>
          </ul>
        </Section>

        <Section number="4" title="第三者サービス">
          <p style={pStyle}>当サービスは以下の第三者サービスを利用しています。</p>

          <ServiceCard
            name="Anthropic Claude API"
            desc="AIエージェントの実行に使用。ユーザーが入力したテキストおよびコンテキストが Anthropic に送信されます。"
          />
          <ServiceCard
            name="RevenueCat"
            desc="サブスクリプション管理に使用。サブスクリプションステータスのみが共有され、決済情報は共有されません。"
          />
          <ServiceCard
            name="Vercel"
            desc="アプリのホスティングに使用。"
          />
          <ServiceCard
            name="Neon Postgres"
            desc="データベースとして使用。"
          />
        </Section>

        <Section number="5" title="決済情報の取り扱い">
          <p style={pStyle}>
            本アプリの有料サブスクリプションは Apple App Store（In-App Purchase）を通じて
            販売されます。クレジットカード情報、Apple ID、課金履歴などの決済情報は
            <strong style={{ color: "var(--text-display)" }}> Apple が直接管理 </strong>
            し、Lattice 運営側はこれらの情報にアクセスしません。
          </p>
          <p style={pStyle}>Lattice が取得・保存する情報は以下のみです。</p>
          <ul style={ulStyle}>
            <li>サブスクリプションのステータス（アクティブ / 期限切れ / キャンセル済み等）</li>
            <li>加入プラン（Free / Starter / Pro）</li>
            <li>サブスクリプションの開始日・終了日</li>
            <li>RevenueCat を介した取引識別子（個人を特定する情報ではありません）</li>
          </ul>
          <p style={pStyle}>
            Apple がどのように決済情報を取り扱うかについては、
            Apple のプライバシーポリシーをご確認ください。
          </p>
          <p style={{ ...pStyle, fontFamily: "'Space Mono', monospace", fontSize: 12, wordBreak: "break-all" }}>
            https://www.apple.com/legal/privacy/
          </p>
        </Section>

        <Section number="6" title="データの保管">
          <p style={pStyle}>
            ユーザーのデータは Neon Postgres（米国・EU・アジアのいずれかのリージョン）に
            保管されます。データは適切なセキュリティ対策の下で保護されます。
          </p>
        </Section>

        <Section number="7" title="データの共有">
          <p style={pStyle}>
            ユーザーの個人情報は、以下の場合を除き第三者と共有されません。
          </p>
          <ul style={ulStyle}>
            <li>ユーザーの明示的な同意がある場合</li>
            <li>法令に基づく開示要求があった場合</li>
            <li>サービスの提供に必要な範囲で第三者サービス（上記第4項）に共有する場合</li>
          </ul>
          <p style={pStyle}>
            ユーザーデータが広告目的で第三者に販売されることはありません。
          </p>
        </Section>

        <Section number="8" title="ユーザーの権利">
          <p style={pStyle}>ユーザーは以下の権利を有します。</p>
          <ul style={ulStyle}>
            <li>自身のデータへのアクセス</li>
            <li>データの訂正</li>
            <li>データの削除（アカウント削除）</li>
            <li>データの利用停止</li>
          </ul>
          <p style={pStyle}>
            これらの権利を行使するには、アプリ内「設定」画面またはお問い合わせ窓口から
            ご連絡ください。
          </p>
        </Section>

        <Section number="9" title="アカウント削除">
          <p style={pStyle}>
            ユーザーはアプリ内「設定 &gt; アカウント削除」からいつでもアカウントを削除できます。
            アカウント削除後、ユーザーに関連するデータは速やかに削除されます
            （法令で保持が義務付けられているデータを除く）。
          </p>
        </Section>

        <Section number="10" title="子どものプライバシー">
          <p style={pStyle}>
            当サービスは13歳未満の児童を対象としていません。13歳未満の児童の個人情報を
            意図的に収集することはありません。
          </p>
        </Section>

        <Section number="11" title="ポリシーの変更">
          <p style={pStyle}>
            本ポリシーは予告なく変更される場合があります。変更後のポリシーは
            本ページに掲載された時点で効力を生じるものとします。
          </p>
        </Section>

        <Section number="12" title="お問い合わせ">
          <p style={pStyle}>
            本ポリシーに関するお問い合わせは、Lattice アプリ内「設定 &gt; サポート」より
            お願いいたします。
          </p>
        </Section>

        <div style={{ height: 40 }} />
      </div>
    </main>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={h2Style}>
        <span style={{ color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace", fontSize: 13, marginRight: 8 }}>{number}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ServiceCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 8,
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px" }}>{name}</p>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  color: "var(--text-secondary)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  margin: "0 0 8px",
};

const h1Style: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: "var(--text-display)",
  margin: "0 0 6px",
  letterSpacing: "-0.02em",
};

const h2Style: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text-display)",
  margin: "0 0 12px",
  letterSpacing: "-0.01em",
};

const updatedStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  color: "var(--text-secondary)",
  margin: "0 0 32px",
};

const pStyle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--text-primary)",
  lineHeight: 1.8,
  margin: "0 0 12px",
};

const ulStyle: React.CSSProperties = {
  margin: "0 0 12px",
  paddingLeft: 20,
  fontSize: 14,
  color: "var(--text-primary)",
  lineHeight: 1.9,
};
