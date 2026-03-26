"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "毎朝9時にGmailの未読メールを要約してSlackに送る",
  "Xで自社名が言及されたら即座に通知する",
  "週次でGoogleアナリティクスのレポートを作成してメールで送る",
];

export default function NewAgentPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");

    const name = prompt.length > 40 ? prompt.slice(0, 40) + "…" : prompt;

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: "",
          prompt,
          trigger: "manual",
          triggerCron: "",
          connections: "[]",
        }),
      });
      if (!res.ok) throw new Error("作成に失敗しました");
      const data = await res.json();
      router.push(`/agents/${data.agent.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#e5e5e5", paddingTop: 56 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#f5f5f5", margin: "0 0 6px" }}>
          新しいエージェント
        </h1>
        <p style={{ color: "#555", fontSize: 13, marginBottom: 32 }}>
          何をしてほしいか、自然な言葉で書いてください
        </p>

        <div style={{
          border: "1px solid #1e1e1e",
          borderRadius: 8,
          backgroundColor: "#111",
          overflow: "hidden",
        }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            placeholder="例：毎朝8時にXのトレンドを調べて、Slackに要約を送る"
            rows={6}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e5e5e5",
              fontSize: 14,
              padding: "18px 20px",
              resize: "none",
              lineHeight: 1.7,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          <div style={{
            borderTop: "1px solid #1a1a1a",
            padding: "10px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 11, color: "#3a3a3a" }}>
              Cmd+Enter で送信
            </span>
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || loading}
              style={{
                backgroundColor: prompt.trim() && !loading ? "#5b5fc7" : "#1a1a1a",
                color: prompt.trim() && !loading ? "#fff" : "#3a3a3a",
                border: "none",
                padding: "8px 18px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: prompt.trim() && !loading ? "pointer" : "default",
              }}
            >
              {loading ? "作成中..." : "作成する"}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: 13, marginTop: 10 }}>{error}</p>
        )}

        <div style={{ marginTop: 36 }}>
          <p style={{ fontSize: 11, color: "#3a3a3a", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            使用例
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                style={{
                  background: "none",
                  border: "1px solid #1a1a1a",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "#555",
                  fontSize: 13,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}