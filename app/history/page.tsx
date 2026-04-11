"use client";

import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  return (
    <main style={{ minHeight: "100%", paddingBottom: 20, background: "transparent", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 20px 0" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          戻る
        </button>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>HISTORY</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-display)", margin: "0 0 20px" }}>実行履歴</h1>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🕐</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>近日対応予定</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>エージェントの実行履歴がここに表示されます</p>
        </div>
      </div>
    </main>
  );
}
