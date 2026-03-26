"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  authorName: string;
  useCount: number;
};

export default function AppPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch("/api/agents/" + id)
      .then(r => r.json())
      .then(data => setAgent(data.agent ?? data))
      .catch(() => {});
  }, [id]);

  const handleRun = async () => {
    if (!agent || !input.trim()) return;
    setLoading(true);
    setResult("");
    setRan(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, agentName: agent.name, agentPrompt: agent.prompt, task: input }),
      });
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          const trimmed = line.replace(/^data: /, "").trim();
          if (!trimmed || trimmed === "[DONE]") continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.type === "token") setResult(prev => prev + parsed.content);
          } catch {}
        }
      }
    } catch {
      setResult("error");
    } finally {
      setLoading(false);
    }
  };

  if (!agent) return (
    <main style={{ minHeight: "100vh", background: "#f8f7f4" }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#9a9a9a" }}>loading...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f8f7f4", color: "#1a1a1a", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "#9a9a9a" }}>
          <Link href="/" style={{ color: "#9a9a9a", textDecoration: "none" }}>ホーム</Link>
          <span>›</span>
          <Link href="/marketplace" style={{ color: "#9a9a9a", textDecoration: "none" }}>AIツール集</Link>
          <span>›</span>
          <span style={{ color: "#5a5a5a" }}>{agent.name}</span>
        </div>

        <div style={{ marginBottom: 36 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", background: "#ede9fe", padding: "4px 12px", borderRadius: 20 }}>{agent.category}</span>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, margin: "16px 0 10px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{agent.name}</h1>
          <p style={{ fontSize: 16, color: "#5a5a5a", lineHeight: 1.8, margin: 0 }}>{agent.description}</p>
          <div style={{ fontSize: 12, color: "#9a9a9a", marginTop: 10 }}>{agent.useCount}回使用 · {agent.authorName}</div>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #e8e6e0", borderRadius: 16, padding: "28px", marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", display: "block", marginBottom: 12 }}>情報を入力してください</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="例：職種「Webエンジニア」、条件「リモート・年収600万以上」"
            rows={4}
            style={{ width: "100%", padding: "14px 16px", background: "#f8f7f4", border: "1.5px solid #e8e6e0", borderRadius: 10, fontSize: 15, color: "#1a1a1a", resize: "vertical", outline: "none", lineHeight: 1.7, fontFamily: "inherit" }}
          />
          <button
            onClick={handleRun}
            disabled={!input.trim() || loading}
            style={{ marginTop: 16, width: "100%", padding: "14px", background: input.trim() && !loading ? "#6366f1" : "#e8e6e0", color: input.trim() && !loading ? "#fff" : "#9a9a9a", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: input.trim() && !loading ? "pointer" : "not-allowed" }}
          >
            {loading ? "生成中..." : "AIに作ってもらう →"}
          </button>
        </div>

        {ran && (
          <div style={{ background: "#fff", border: "1.5px solid #e8e6e0", borderRadius: 16, padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{loading ? "生成中..." : "完成しました"}</span>
              {!loading && result && (
                <button onClick={() => navigator.clipboard.writeText(result)} style={{ padding: "6px 16px", background: "#f8f7f4", border: "1.5px solid #e8e6e0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#5a5a5a", cursor: "pointer" }}>コピー</button>
              )}
            </div>
            <div style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 1.9, whiteSpace: "pre-wrap", minHeight: 80 }}>{result || (loading ? "▍" : "")}</div>
          </div>
        )}

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link href="/marketplace" style={{ fontSize: 14, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>← 他のAIツールを見る</Link>
        </div>
      </div>
    </main>
  );
}