import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | Lattice",
  description: "Latticeの利用規約です。",
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>利用規約</h1>
        <p style={{ color: "#8b92a9", fontSize: 13, marginBottom: 40 }}>最終更新日：2026年3月22日</p>

        {[
          {
            title: "1. 本規約の適用",
            body: "本規約は、Lattice（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上で当サービスを利用するものとします。",
          },
          {
            title: "2. 禁止事項",
            body: "ユーザーは以下の行為を行ってはなりません。\n\n・法令または公序良俗に違反する行為\n・他のユーザーに不利益を与える行為\n・当サービスの運営を妨害する行為\n・虚偽の情報を登録する行為\n・他者の著作権・知的財産権を侵害するプロンプトの出品\n・スパムや詐欺的な行為",
          },
          {
            title: "3. プロンプトの出品について",
            body: "出品者は、出品するプロンプトが第三者の権利を侵害しないことを保証するものとします。当サービスは出品されたプロンプトの内容について責任を負いません。",
          },
          {
            title: "4. 収益の分配",
            body: "有料プロンプトが購入された場合、販売価格の80%が出品者に支払われます。残りの20%は当サービスの運営費として利用されます。支払いはStripe Connectを通じて行われます。",
          },
          {
            title: "5. 返金ポリシー",
            body: "デジタルコンテンツの性質上、原則として返金には応じられません。ただし、出品者の重大な虚偽記載が認められた場合は、当サービスの判断により対応します。",
          },
          {
            title: "6. 免責事項",
            body: "当サービスは、サービスの中断・停止・終了によって生じた損害について責任を負いません。また、ユーザー間のトラブルについても責任を負いません。",
          },
          {
            title: "7. 規約の変更",
            body: "当サービスは、必要に応じて本規約を変更することがあります。変更後の規約はサービス上に掲載した時点で効力を生じます。",
          },
          {
            title: "8. お問い合わせ",
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