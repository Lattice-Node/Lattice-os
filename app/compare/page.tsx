"use client";
import { useState } from "react";
import Nav from "@/components/Nav";

const MODELS = [
  { key: "chatgpt", label: "ChatGPT", color: "#10a37f", bg: "#f0fdf4" },
  { key: "claude", label: "Claude", color: "#d97706", bg: "#fffbeb" },
  { key: "gemini", label: "Gemini", color: "#4285f4", bg: "#eff6ff" },
];

export default function ComparePage() {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setSent(true);
    const newLoading: Record<string, boolean> = {};
    MODELS.forEach(m => newLoading[m.key] = true);
    setLoading(newLoading);
    setResults({});

    await Promise.all(MODELS.map(async (model) => {
      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, model: model.key }),
        });
        const data = await res.json();
        setResults(prev => ({ ...prev, [model.key]: data.answer || data.error || "エラーが発生しました" }));
      } catch {
        setResults(prev => ({ ...prev, [model.key]: "エラーが発生しました" }));
      } finally {
        setLoading(prev => ({ ...prev, [model.key]: false }));
      }
    }));
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
      <Nav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-light)", color: "var(--accent)", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 20 }}>
            無料 · 登録不要
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
            ChatGPT vs Gemini vs Claude
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>
            同じ質問を3つのAIに同時に投げて、回答を比較する。
          </p>
        </div>

        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", marginBottom: 40, boxShadow: "var(--shadow-sm)" }}>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="質問を入力してください（例：最強のビジネスアイデアを教えて）"
            rows={4}
            style={{
              width: "100%", padding: "14px 16px",
              background: "var(--bg)", border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-md)", fontSize: 15,
              color: "var(--text-primary)", resize: "vertical",
              outline: "none", lineHeight: 1.7
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button
              onClick={handleSubmit}
              disabled={!question.trim()}
              style={{
                padding: "12px 32px", background: question.trim() ? "var(--accent)" : "var(--border)",
                color: question.trim() ? "#fff" : "var(--text-muted)",
                border: "none", borderRadius: "var(--radius-md)",
                fontSize: 15, fontWeight: 700, cursor: question.trim() ? "pointer" : "not-allowed",
                transition: "all 0.15s"
              }}
            >
              3つのAIに同時に聞く →
            </button>
          </div>
        </div>

        {sent && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {MODELS.map(model => (
              <div key={model.key} style={{
                background: "var(--surface)", border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-lg)", overflow: "hidden",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: model.color }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{model.label}</span>
                </div>
                <div style={{ padding: "20px", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, minHeight: 120 }}>
                  {loading[model.key] ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
                      <span>回答を生成中...</span>
                    </div>
                  ) : (
                    results[model.key] || ""
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!sent && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {MODELS.map(model => (
              <div key={model.key} style={{
                background: "var(--surface)", border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-lg)", overflow: "hidden",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: model.color }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{model.label}</span>
                </div>
                <div style={{ padding: "20px", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, minHeight: 120 }}>
                  質問を入力して送信すると、ここに回答が表示されます。
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}