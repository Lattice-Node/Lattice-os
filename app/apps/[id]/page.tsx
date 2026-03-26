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
  fields: string;
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
        body: JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
          agentPrompt: agent.prompt,
          task: input,
        }),
      });

      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          const trimmed = line.replace(/^data: /, "").trim();
          if (!trimmed || trimmed === "[DONE]") continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.type === "token") {
              setResult(prev => prev + parsed.content);
            }
          } catch {}
        }
      }
    } catch (e) {
      setResult("郢ｧ・ｨ郢晢ｽｩ郢晢ｽｼ邵ｺ讙主験騾墓ｺ假ｼ邵ｺ・ｾ邵ｺ蜉ｱ笳・ｸｲ繧・ｽらｸｺ繝ｻ・ｸﾂ陟趣ｽｦ髫ｧ・ｦ邵ｺ蜉ｱ窶ｻ邵ｺ荳岩味邵ｺ霈費ｼ樒ｸｲ繝ｻ);
    } finally {
      setLoading(false);
    }
  };

  if (!agent) {
    return (
      <main style={{ minHeight: "100vh", background: "#f8f7f4" }}>
        <Nav />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#9a9a9a" }}>
          髫ｱ・ｭ邵ｺ・ｿ髴趣ｽｼ邵ｺ・ｿ闕ｳ・ｭ...
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8f7f4", color: "#1a1a1a", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* 郢昜ｻ｣ﾎｦ邵ｺ荳岩・ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "#9a9a9a" }}>
          <Link href="/" style={{ color: "#9a9a9a", textDecoration: "none" }}>郢晏ｸ吶・郢晢｣ｰ</Link>
          <span>遯ｶ・ｺ</span>
          <Link href="/marketplace" style={{ color: "#9a9a9a", textDecoration: "none" }}>AI郢昴・繝ｻ郢晢ｽｫ鬮ｮ繝ｻ/Link>
          <span>遯ｶ・ｺ</span>
          <span style={{ color: "#5a5a5a" }}>{agent.name}</span>
        </div>

        {/* 郢晏･繝｣郢敖郢晢ｽｼ */}
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", background: "#ede9fe", padding: "4px 12px", borderRadius: 20 }}>
            {agent.category}
          </span>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, margin: "16px 0 10px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {agent.name}
          </h1>
          <p style={{ fontSize: 16, color: "#5a5a5a", lineHeight: 1.8, margin: 0 }}>
            {agent.description}
          </p>
          <div style={{ fontSize: 12, color: "#9a9a9a", marginTop: 10 }}>
            {agent.useCount}陜玲ｨ費ｽｽ・ｿ騾包ｽｨ ・ゑｽｷ {agent.authorName}
          </div>
        </div>

        {/* 陷茨ｽ･陷牙ｸ吶♀郢晢ｽｪ郢ｧ・｢ */}
        <div style={{ background: "#fff", border: "1.5px solid #e8e6e0", borderRadius: 16, padding: "28px", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", display: "block", marginBottom: 12 }}>
            隲繝ｻ・ｰ・ｱ郢ｧ雋槭・陷牙ｸ呻ｼ邵ｺ・ｦ邵ｺ荳岩味邵ｺ霈費ｼ・          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="關灘・・ｼ螟翫・驕橸ｽｮ邵ｲ菫Ｆb郢ｧ・ｨ郢晢ｽｳ郢ｧ・ｸ郢昜ｹ昴＞邵ｲ髦ｪﾂ竏ｵ謫・脂・ｶ邵ｲ蠕湖懃ｹ晢ｽ｢郢晢ｽｼ郢晏現繝ｻ鬨ｾ・ｱ5郢晢ｽｻ陝ｷ・ｴ陷ｿ繝ｻ00闕ｳ繝ｻ・ｻ・･闕ｳ鄙ｫﾂ繝ｻ
            rows={4}
            style={{
              width: "100%", padding: "14px 16px",
              background: "#f8f7f4", border: "1.5px solid #e8e6e0",
              borderRadius: 10, fontSize: 15, color: "#1a1a1a",
              resize: "vertical", outline: "none", lineHeight: 1.7,
              fontFamily: "inherit"
            }}
          />
          <button
            onClick={handleRun}
            disabled={!input.trim() || loading}
            style={{
              marginTop: 16, width: "100%",
              padding: "14px", background: input.trim() && !loading ? "#6366f1" : "#e8e6e0",
              color: input.trim() && !loading ? "#fff" : "#9a9a9a",
              border: "none", borderRadius: 10,
              fontSize: 16, fontWeight: 700, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s"
            }}
          >
            {loading ? "騾墓ｻ薙・闕ｳ・ｭ..." : "AI邵ｺ・ｫ闖ｴ諛岩夢邵ｺ・ｦ郢ｧ繧・ｽ臥ｸｺ繝ｻ遶翫・}
          </button>
        </div>

        {/* 驍ｨ蜈域｣｡郢ｧ・ｨ郢晢ｽｪ郢ｧ・｢ */}
        {ran && (
          <div style={{ background: "#fff", border: "1.5px solid #e8e6e0", borderRadius: 16, padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                {loading ? "騾墓ｻ薙・闕ｳ・ｭ..." : "陞ｳ譴ｧ繝ｻ邵ｺ蜉ｱ竏ｪ邵ｺ蜉ｱ笳・}
              </span>
              {!loading && result && (
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  style={{
                    padding: "6px 16px", background: "#f8f7f4",
                    border: "1.5px solid #e8e6e0", borderRadius: 8,
                    fontSize: 13, fontWeight: 600, color: "#5a5a5a", cursor: "pointer"
                  }}
                >
                  郢ｧ・ｳ郢晄鱒繝ｻ
                </button>
              )}
            </div>
            <div style={{
              fontSize: 15, color: "#1a1a1a", lineHeight: 1.9,
              whiteSpace: "pre-wrap", minHeight: 80
            }}>
              {result || (loading ? "隨・・ : "")}
            </div>
          </div>
        )}

        {/* 闔画じ繝ｻ郢昴・繝ｻ郢晢ｽｫ */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link href="/marketplace" style={{ fontSize: 14, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
            遶翫・闔画じ繝ｻAI郢昴・繝ｻ郢晢ｽｫ郢ｧ螳夲ｽｦ荵晢ｽ・          </Link>
        </div>
      </div>
    </main>
  );
}