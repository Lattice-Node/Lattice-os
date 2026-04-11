"use client";

import AppsGrid from "@/components/AppsGrid";

export default function AppsPage() {
  return (
    <main
      style={{
        minHeight: "100%",
        paddingBottom: 20,
        background: "var(--bg)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 20px 0" }}>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: "var(--text-secondary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "0 0 8px",
          }}
        >
          APPS
        </p>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-display)",
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          アプリ
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>
          長押しで並び替え・削除
        </p>
      </div>
      <AppsGrid />
    </main>
  );
}
