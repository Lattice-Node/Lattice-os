"use client";

import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  return (
    <main style={{ minHeight: "100%", paddingBottom: 20, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 20px 0" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          戻る
        </button>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>FEEDBACK</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-display)", margin: "0 0 20px" }}>フィードバック</h1>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>ご意見・ご要望をお聞かせください</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>X (Twitter) でフィードバックを受け付けています</p>
          <button
            onClick={() => window.open("https://x.com/Lattice_Node", "_blank")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 999, border: "none",
              background: "#000", color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            X を開く
          </button>
        </div>
      </div>
    </main>
  );
}
