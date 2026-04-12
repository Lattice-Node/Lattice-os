"use client";

export default function FeedDetailError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ minHeight: "100%", background: "var(--bg)", color: "var(--text-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: 14 }}>読み込みに失敗しました</p>
      <button onClick={reset} style={{ padding: "10px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
        再試行
      </button>
    </main>
  );
}
