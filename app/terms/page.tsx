import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | Lattice",
  description: "Latticeの利用規約です。",
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0e1117", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>利用規約</h1>
        <p style={{ color: "#8b92a9", fontSize: 13, marginBottom: 40 }}>最終更新日：2026年4月3日</p>

        {[
          {
            title: "1. 本規約の適用",
            body: "本規約は、Lattice（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上で当サービスを利用するものとします。",
          },
          {
            title: "2. サービスの概要",
            body: "当サービスは、自然言語によるAIエージェントの作成・実行・スケジュール管理を提供するプラットフォームです。エージェントの実行にはクレジットを消費します。",
          },
          {
            title: "3. アカウント",
            body: "ユーザーはGoogle、GitHubアカウントを使用してログインします。アカウント情報の正確性はユーザーの責任とします。ユーザーは設定画面からいつでもアカウントを削除できます。",
          },
          {
            title: "4. 料金・サブスクリプション",
            body: "当サービスには、以下の4つのプランがあります。\n\n・Free（無料）\n・Starter（月額980円）\n・Pro（月額2,480円）\n・Business（月額6,980円）\n\n・有料プランは月額自動更新のサブスクリプションです\n・サブスクリプションは毎月自動的に更新され、解約するまで課金が継続します\n・解約は設定画面からいつでも可能です。解約後は現在の請求期間の終了時にFreeプランに移行します\n・クレジットの追加購入は有料プラン加入者のみ利用可能です\n・未使用クレジットの翌月繰越はありません\n・決済はStripeを通じて処理されます",
          },
          {
            title: "5. 返金ポリシー",
            body: "サブスクリプション料金は原則として返金に応じません。クレジット追加購入も同様です。ただし、サービス側の重大な障害があった場合は個別に対応します。",
          },
          {
            title: "6. 禁止事項",
            body: "ユーザーは以下の行為を行ってはなりません。\n\n・法令または公序良俗に違反する行為\n・他のユーザーに不利益を与える行為\n・当サービスの運営を妨害する行為\n・虚偽の情報を登録する行為\n・APIの不正利用・過剰なリクエスト送信\n・当サービスのリバースエンジニアリング",
          },
          {
            title: "7. 外部サービス連携",
            body: "ユーザーはGmail・Discord・LINEなどの外部サービスとの連携を任意で設定できます。連携により発生した外部サービス上の問題について、当サービスは責任を負いません。",
          },
          {
            title: "8. AIエージェントの出力",
            body: "AIエージェントの実行結果はAI（Anthropic Claude）によって生成されます。生成された内容の正確性・適切性について、当サービスは保証しません。重要な意思決定にはユーザー自身の判断を優先してください。",
          },
          {
            title: "9. 免責事項",
            body: "当サービスは、サービスの中断・停止・終了によって生じた損害について責任を負いません。また、AIエージェントの実行結果に起因する損害についても責任を負いません。",
          },
          {
            title: "10. 規約の変更",
            body: "当サービスは、必要に応じて本規約を変更することがあります。変更後の規約はサービス上に掲載した時点で効力を生じます。",
          },
          {
            title: "11. お問い合わせ",
            body: "利用規約に関するお問い合わせは、X（@Lattice_Node）のDMまでご連絡ください。",
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
