"use client";

import { useState } from "react";

type Props = {
  agentId: string | null;
  agentName: string | null;
  latestOutput: string | null;
  latestDate: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function renderMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:600;color:#e8eaf0;margin:16px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:600;color:#e8eaf0;margin:20px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;color:#e8eaf0;margin:0 0 12px">$1</h1>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;margin:4px 0;font-size:13px;line-height:1.6"><span style="color:#6c71e8;flex-shrink:0">-</span><span style="color:#9096a8">$1</span></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8eaf0;font-weight:500">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #2a2d35;margin:16px 0"/>')
    .replace(/\n\n/g, '<div style="height:8px"></div>')
    .replace(/\n/g, "");
}

export default function NewsClient({ agentId, agentName, latestOutput, latestDate }: Props) {
  const [output, setOutput] = useState(latestOutput);
  const [date, setDate] = useState(latestDate);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    if (!agentId || running) return;
    setRunning(true);
    setError("");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (data.ok && data.output) {
        setOutput(data.output);
        setDate(new Date().toISOString());
      } else {
        setError(data.error || "Failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      <p className="page-label">INBOX</p>
      <h1 className="page-title">AI News</h1>

      {agentId ? (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleRun}
            disabled={running}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: running ? "#1a1d24" : "#6c71e8",
              color: running ? "#4a5060" : "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: running ? "default" : "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.15s",
            }}
          >
            {running ? "Generating..." : "Generate latest AI news"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: 24 }}>
          <p style={{ color: "#9096a8", fontSize: 13 }}>
            No AI news agent found.
          </p>
          <a href="/store" style={{ color: "#6c71e8", fontSize: 13, textDecoration: "none" }}>
            Add from Store
          </a>
        </div>
      )}

      {error && (
        <div style={{
          background: "#2a1215",
          border: "1px solid #5c2020",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 12,
        }}>
          <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
        </div>
      )}

      {output ? (
        <div className="card" style={{ padding: 20 }}>
          {date && (
            <p style={{ fontSize: 11, color: "#4a5060", marginBottom: 12 }}>
              {formatDate(date)}
            </p>
          )}
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
        </div>
      ) : !error && agentId && (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "#4a5060", fontSize: 13 }}>
            Press the button above to generate today's AI news.
          </p>
        </div>
      )}
    </div>
  );
}