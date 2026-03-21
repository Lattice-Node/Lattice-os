"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { parseFile } from "@/lib/fileParser";

type Field = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  options: string;
  required: boolean;
};

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  agentType: string;
  webhookUrl: string;
  fields: string;
  authorName: string;
  price: number;
};

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, "<h3 style=\"font-size:15px;font-weight:700;margin:12px 0 4px;color:#e8eaf0\">$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 style=\"font-size:18px;font-weight:700;margin:16px 0 6px;color:#e8eaf0\">$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 style=\"font-size:22px;font-weight:800;margin:16px 0 8px;color:#e8eaf0\">$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code style=\"background:#1a1e2e;color:#81C784;padding:1px 6px;border-radius:4px;font-size:12px\">$1</code>")
    .replace(/^- (.+)$/gm, "<li style=\"margin-bottom:4px\">$1</li>")
    .replace(/(<li.*<\/li>\n?)+/g, "<ul style=\"padding-left:18px;margin-bottom:10px\">$&</ul>")
    .replace(/\n\n/g, "</p><p style=\"margin-bottom:10px\">")
    .replace(/^(?!<[h|u|p|s])(.+)$/gm, "<p style=\"margin-bottom:10px\">$1</p>");
}

const CATEGORY_COLORS: Record<string, string> = {
  Research: "#4FC3F7", Writing: "#81C784", Code: "#FF8A65", Business: "#CE93D8",
  Medical: "#F06292", Legal: "#FFD54F", Finance: "#4DB6AC", Custom: "#FF8A65", default: "#90A4AE",
};

export default function AppPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promptCopied, setPromptCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgent(data.agent);
        try {
          const f = JSON.parse(data.agent.fields || "[]");
          setFields(f);
          const initial: Record<string, string> = {};
          f.forEach((field: Field) => { initial[field.id] = ""; });
          setValues(initial);
        } catch { setFields([]); }
        setLoading(false);
      });
  }, [id]);

  const handleCopyPrompt = () => {
    if (!agent) return;
    navigator.clipboard.writeText(agent.prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleFileChange = async (fieldId: string, file: File | null) => {
    if (!file) return;
    setFileNames((prev) => ({ ...prev, [fieldId]: file.name }));
    setStatus("ファイルを読み込み中...");
    try {
      const text = await parseFile(file);
      setValues((prev) => ({ ...prev, [fieldId]: text }));
      setStatus(null);
    } catch {
      setStatus("ファイルの読み込みに失敗しました");
    }
  };

  const handleRun = async () => {
    if (!agent || running) return;
    if (!session) { signIn("github"); return; }

    if (agent.price > 0) {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, agentName: agent.name, price: agent.price }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
    }

    setRunning(true);
    setDone(false);
    setOutput("");
    setStatus(null);

    const fieldSummary = fields.map((f) => {
      const val = values[f.id];
      if (f.type === "file" && val) return `${f.label}（ファイル内容）:\n${val.slice(0, 8000)}`;
      return `${f.label}: ${val}`;
    }).join("\n\n");

    const task = `以下の情報をもとに処理してください:\n\n${fieldSummary}`;

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, agentPrompt: agent.prompt, agentName: agent.name, task }),
      });

      if (!res.ok || !res.body) { setStatus("実行エラー"); setRunning(false); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const chunk of lines) {
          const line = chunk.replace(/^data: /, "").trim();
          if (!line) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === "status") setStatus(data.message);
            else if (data.type === "token") { setOutput((prev) => prev + data.content); setStatus(null); }
            else if (data.type === "done") { setDone(true); setRunning(false); }
            else if (data.type === "error") { setStatus(data.message); setRunning(false); }
          } catch { }
        }
      }
    } catch (err) {
      setStatus("エラー: " + String(err));
      setRunning(false);
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5068" }}>読み込み中...</div>;
  if (!agent) return <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5068" }}>プロンプトが見つかりません</div>;

  const color = CATEGORY_COLORS[agent.category] ?? CATEGORY_COLORS.default;

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <nav style={{ borderBottom: "1px solid #1c2136", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#e8eaf0" }}>
          <span style={{ fontSize: 18, color: "#3b82f6" }}>◈</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Lattice</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/marketplace" style={{ fontSize: 13, color: "#8b92a9", textDecoration: "none" }}>← 一覧に戻る</Link>
          {session ? (
            <img src={session.user?.image ?? ""} style={{ width: 28, height: 28, borderRadius: "50%" }} alt="avatar" />
          ) : (
            <button onClick={() => signIn("github")} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>ログイン</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{agent.category}</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>{agent.name}</h1>
          <p style={{ fontSize: 14, color: "#8b92a9", lineHeight: 1.7, marginBottom: 8 }}>{agent.description}</p>
          <div style={{ fontSize: 12, color: "#4a5068" }}>by {agent.authorName}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <button
            onClick={handleCopyPrompt}
            disabled={agent.price > 0}
            style={{
              background: promptCopied ? "#34d39922" : "#0d1120",
              border: `2px solid ${promptCopied ? "#34d399" : "#1c2136"}`,
              borderRadius: 12, padding: "18px 16px",
              cursor: agent.price > 0 ? "not-allowed" : "pointer",
              textAlign: "center", transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{promptCopied ? "✅" : "📋"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: promptCopied ? "#34d399" : agent.price > 0 ? "#4a5068" : "#e8eaf0" }}>
              {promptCopied ? "コピーしました！" : agent.price > 0 ? "🔒 有料プロンプト" : "コピーして使う"}
            </div>
            <div style={{ fontSize: 11, color: "#4a5068", marginTop: 4 }}>
              {agent.price > 0 ? `¥${agent.price}` : "ChatGPT・Claudeに貼り付け"}
            </div>
          </button>

          <button
            onClick={handleRun}
            disabled={running}
            style={{
              background: running ? "#1c2136" : "#2563eb",
              border: "2px solid transparent",
              borderRadius: 12, padding: "18px 16px",
              cursor: running ? "not-allowed" : "pointer",
              textAlign: "center", transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>
              {running
                ? <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid #ffffff44", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : "▶"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {running ? "実行中..." : !session ? "ログインして実行" : agent.price > 0 ? `¥${agent.price} で実行` : "Latticeで実行"}
            </div>
            <div style={{ fontSize: 11, color: "#93c5fd", marginTop: 4 }}>入力して結果を取得</div>
          </button>
        </div>

        {fields.length > 0 && (
          <div style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 14, padding: "24px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4a5068", marginBottom: 18 }}>入力</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {fields.map((field) => (
                <div key={field.id}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c8cad8", marginBottom: 6 }}>
                    {field.label}{field.required && <span style={{ color: "#ff6b6b", marginLeft: 4 }}>*</span>}
                  </label>
                  {field.type === "file" ? (
                    <div onClick={() => fileRefs.current[field.id]?.click()} style={{ background: "#151722", border: "2px dashed #1c2136", borderRadius: 8, padding: "20px", textAlign: "center", cursor: "pointer" }}>
                      <input type="file" accept=".xlsx,.xls,.csv,.pdf,.txt" ref={(el) => { fileRefs.current[field.id] = el; }} onChange={(e) => handleFileChange(field.id, e.target.files?.[0] ?? null)} style={{ display: "none" }} />
                      <div style={{ fontSize: 13, color: fileNames[field.id] ? "#3b82f6" : "#4a5068" }}>{fileNames[field.id] ?? "クリックしてファイルを選択"}</div>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea placeholder={field.placeholder} value={values[field.id] || ""} onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))} rows={4}
                      style={{ width: "100%", background: "#151722", border: "1px solid #1c2136", borderRadius: 8, padding: "10px 14px", color: "#e8eaf0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  ) : (
                    <input type={field.type} placeholder={field.placeholder} value={values[field.id] || ""} onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      style={{ width: "100%", background: "#151722", border: "1px solid #1c2136", borderRadius: 8, padding: "10px 14px", color: "#e8eaf0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(status || output) && (
          <div style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #1c2136", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4a5068" }}>
                {running ? "⚡ 生成中..." : done ? "✅ 完了" : "出力"}
              </span>
              {output && (
                <button onClick={() => { navigator.clipboard.writeText(output); setOutputCopied(true); setTimeout(() => setOutputCopied(false), 2000); }}
                  style={{ background: "none", border: "1px solid #1c2136", color: outputCopied ? "#34d399" : "#4a5068", borderRadius: 6, fontSize: 11, padding: "4px 10px", cursor: "pointer" }}>
                  {outputCopied ? "✓ コピー済み" : "コピー"}
                </button>
              )}
            </div>
            {status && <div style={{ padding: "10px 20px", fontSize: 13, color: "#3b82f6", borderBottom: "1px solid #1c2136" }}>{status}</div>}
            {output && <div style={{ padding: "20px", fontSize: 14, lineHeight: 1.8, color: "#c8cad8", maxHeight: 600, overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />}
          </div>
        )}
      </div>
    </div>
  );
}