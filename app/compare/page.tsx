"use client";
import { useState } from "react";
import Nav from "@/components/Nav";

const SAMPLE_QUESTIONS = [
  "日本のGDPを3行で説明して",
  "Pythonでフィボナッチ数列を書いて",
  "最強のビジネスアイデアを1つ教えて",
  "宇宙の始まりを子供に説明して",
  "2026年のAIトレンドを予測して",
];

const AI_MODELS = [
  { id: "gpt", name: "ChatGPT", color: "#10a37f", bg: "#f0fdf8" },
  { id: "claude", name: "Claude", color: "#d97706", bg: "#fffbeb" },
  { id: "gemini", name: "Gemini", color: "#4f46e5", bg: "#f5f3ff" },
];

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [asked, setAsked] = useState(false);

  const ask = async () => {
    if (!query.trim()) return;
    setAsked(true);
    setResults({});
    const newLoading: Record<string, boolean> = {};
    AI_MODELS.forEach(m => { newLoading[m.id] = true; });
    setLoading(newLoading);

    await Promise.all(
      AI_MODELS.map(async (model) => {
        try {
          const res = await fetch("/api/compare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, model: model.id }),
          });
          const data = await res.json();
          setResults(prev => ({ ...prev, [model.id]: data.result || data.error || "エラー" }));
        } catch {
          setResults(prev => ({ ...prev, [model.id]: "接続エラー" }));
        } finally {
          setLoading(prev => ({ ...prev, [model.id]: false }));
        }
      })
    );
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8f8f6", color: "#111827", fontFamily: "'DM Sans', 'Hiragino Sans', 'Yu Gothic', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .sample-btn { transition: all 0.15s; }
        .sample-btn:hover { background: #ede9fe !important; color: #6366f1 !important; border-color: #c4b5fd !important; }
        .ask-btn { transition: background 0.15s; }
        .ask-btn:hover { background: #4f46e5 !important; }
        textarea:focus { outline: none; border-color: #a5b4fc !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>
      <Nav />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", color: "#6366f1", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 16, letterSpacing: "0.05em" }}>
            ChatGPT · Claude · Gemini
          </div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: "#111827", marginBottom: 12, letterSpacing: "-0.02em" }}>
            AIを比較する
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7 }}>
            同じ質問を3つのAIに同時に送信して、回答を比べる。
          </p>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "24px", marginBottom: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="AIに聞きたいことを入力..."
            rows={3}
            style={{ width: "100%", padding: "14px 16px", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10, color: "#111827", fontSize: 15, resize: "none", fontFamily: "inherit", lineHeight: 1.7, marginBottom: 16 }}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(); }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {SAMPLE_QUESTIONS.map(q => (
              <button key={q} className="sample-btn" onClick={() => setQuery(q)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: "1.5px solid #e5e7eb", background: "#fff", color: "#4b5563", cursor: "pointer" }}>
                {q}
              </button>
            ))}
          </div>
          <button className="ask-btn" onClick={ask} style={{ width: "100%", padding: "14px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            3つのAIに同時に聞く
          </button>
        </div>

        {asked && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {AI_MODELS.map(model => (
              <div key={model.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "14px 18px", background: model.bg, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: model.color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: model.color }}>{model.name}</span>
                </div>
                <div style={{ padding: "18px", fontSize: 14, color: "#374151", lineHeight: 1.8, minHeight: 120 }}>
                  {loading[model.id] ? (
                    <div style={{ color: "#9ca3af", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, border: "2px solid #e5e7eb", borderTopColor: model.color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      生成中...
                    </div>
                  ) : (
                    results[model.id] || ""
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!asked && (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "#9ca3af" }}>
            <p style={{ fontSize: 14 }}>上の入力欄に質問を入力して「3つのAIに同時に聞く」を押してください</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}