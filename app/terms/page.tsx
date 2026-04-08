"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-primary)",
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 20px 24px" }}>
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
        <h1 style={h1Style}>利用規約</h1>
        <p style={updatedStyle}>最終更新日: 2026年4月8日</p>

        <Section number="1" title="本規約の適用">
          <p style={pStyle}>
            本規約は、Lattice（以下「当サービス」）の利用に関する条件を定めるものです。
            ユーザーは本規約に同意した上で当サービスを利用するものとします。
          </p>
        </Section>

        <Section number="2" title="サービスの概要">
          <p style={pStyle}>
            当サービスは、自然言語によるAIエージェントの作成・実行・スケジュール管理を提供する
            プラットフォームです。エージェントは月次の実行回数上限内で利用できます。
          </p>
        </Section>

        <Section number="3" title="アカウント">
          <p style={pStyle}>
            ユーザーは Google または Apple アカウントを使用してログインします。
            アカウント情報の正確性はユーザーの責任とします。
            ユーザーは設定画面からいつでもアカウントを削除できます。
          </p>
        </Section>

        <Section number="4" title="料金プラン">
          <p style={pStyle}>当サービスには以下のプランがあります。</p>

          <div style={planCardStyle}>
            <p style={planNameStyle}>Free（無料）</p>
            <ul style={ulStyle}>
              <li>エージェント 3体まで</li>
              <li>月30回の自動実行</li>
              <li>基本機能</li>
            </ul>
          </div>

          <div style={planCardStyle}>
            <p style={planNameStyle}>Starter（月額980円）</p>
            <ul style={ulStyle}>
              <li>エージェント 10体まで</li>
              <li>月150回の自動実行</li>
              <li>Tool Use（URL取得・Gmail送信）</li>
              <li>Web検索</li>
            </ul>
          </div>

          <div style={planCardStyle}>
            <p style={planNameStyle}>Pro（月額2,480円）</p>
            <ul style={ulStyle}>
              <li>エージェント 無制限</li>
              <li>月800回の自動実行</li>
              <li>Tool Use（全機能）</li>
              <li>Web検索</li>
              <li>高度なメモリ機能</li>
              <li>全テンプレート利用可能</li>
            </ul>
          </div>

          <p style={pStyle}>
            各プランの詳細は、アプリ内「設定」画面でご確認いただけます。
          </p>
        </Section>

        <Section number="5" title="サブスクリプションと自動更新">
          <p style={pStyle}>
            本サービスの有料プランは自動更新型のサブスクリプションです。
          </p>
          <ul style={ulStyle}>
            <li>サブスクリプションは現在の期間終了の少なくとも24時間前までにキャンセルされない限り、自動的に更新されます</li>
            <li>更新料金は現在の期間終了から24時間以内に Apple ID アカウントに請求されます</li>
            <li>月次実行回数は毎月の課金日にリセットされます</li>
            <li>プランをアップグレードした場合、新しい上限が即座に適用されます</li>
            <li>プランをダウングレードした場合、現在の請求期間終了後に新プランが適用されます</li>
          </ul>
        </Section>

        <Section number="6" title="解約方法">
          <p style={pStyle}>サブスクリプションは以下の方法で解約できます。</p>
          <p style={{ ...pStyle, fontWeight: 600, color: "var(--text-display)" }}>iOS の場合:</p>
          <ol style={olStyle}>
            <li>「設定」アプリを開く</li>
            <li>自分の名前 →「サブスクリプション」をタップ</li>
            <li>「Lattice」を選択</li>
            <li>「サブスクリプションをキャンセル」をタップ</li>
          </ol>
          <p style={pStyle}>
            または、Lattice アプリ内「設定 &gt; サブスクリプション管理」から
            Apple のサブスクリプション管理画面を直接開くこともできます。
          </p>
          <p style={pStyle}>
            解約後も、現在の請求期間の終了まで有料プランの機能を引き続きご利用いただけます。
          </p>
        </Section>

        <Section number="7" title="返金ポリシー">
          <p style={pStyle}>
            サブスクリプション料金の返金は、Apple のポリシーに従って処理されます。
            返金リクエストは以下からお願いします。
          </p>
          <p style={{ ...pStyle, fontFamily: "'Space Mono', monospace", fontSize: 12, wordBreak: "break-all" }}>
            https://reportaproblem.apple.com
          </p>
          <p style={pStyle}>
            Lattice 運営側で個別の返金対応はできません。
          </p>
        </Section>

        <Section number="8" title="価格変更">
          <p style={pStyle}>
            価格変更が発生する場合、Apple のポリシーに従い事前に通知されます。
            価格変更に同意しない場合はサブスクリプションをキャンセルすることができます。
          </p>
        </Section>

        <Section number="9" title="禁止事項">
          <p style={pStyle}>ユーザーは以下の行為を行ってはなりません。</p>
          <ul style={ulStyle}>
            <li>法令または公序良俗に違反する行為</li>
            <li>他のユーザーに不利益を与える行為</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>虚偽の情報を登録する行為</li>
            <li>API の不正利用・過剰なリクエスト送信</li>
            <li>当サービスのリバースエンジニアリング</li>
            <li>AIエージェントを用いた違法行為または有害コンテンツの生成</li>
          </ul>
        </Section>

        <Section number="10" title="免責事項">
          <p style={pStyle}>
            当サービスは現状有姿で提供されます。当サービスの利用により生じた損害について、
            運営者は一切の責任を負いません。AIエージェントの出力内容の正確性は保証されません。
          </p>
        </Section>

        <Section number="11" title="規約の変更">
          <p style={pStyle}>
            本規約は予告なく変更される場合があります。変更後の規約は本ページに掲載された時点で
            効力を生じるものとします。
          </p>
        </Section>

        <Section number="12" title="お問い合わせ">
          <p style={pStyle}>
            本規約に関するお問い合わせは、Lattice アプリ内「設定 &gt; サポート」よりお願いいたします。
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

const olStyle: React.CSSProperties = {
  margin: "0 0 12px",
  paddingLeft: 20,
  fontSize: 14,
  color: "var(--text-primary)",
  lineHeight: 1.9,
};

const planCardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "16px 18px",
  marginBottom: 10,
};

const planNameStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "var(--text-display)",
  margin: "0 0 8px",
};
