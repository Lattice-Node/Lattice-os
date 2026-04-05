"use client";

export default function ConceptStep() {
  return (
    <div style={{ textAlign: "center", padding: "0 8px" }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 style={{
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text-display)",
        margin: "0 0 12px",
      }}>
        Latticeへようこそ
      </h2>
      <p style={{
        fontSize: 14,
        color: "var(--text-secondary)",
        lineHeight: 1.7,
        margin: 0,
      }}>
        LatticeはAIエージェントを作成・実行できるプラットフォームです。
        あなただけの自動化ワークフローを、コード不要で構築できます。
      </p>
    </div>
  );
}
