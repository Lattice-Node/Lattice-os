"use client";

import { useState } from "react";
import { nativeFetch } from "@/lib/native-fetch";

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
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;color:#e8eaf0;margin:12px 0 4px">$1</h3>')
    .replace(/^## (\d+)\. (.+)$/gm, '<h2 style="font-size:15px;font-weight:600;color:#e8eaf0;margin:18px 0 6px;padding-top:12px;border-top:1px solid #2e3440"><span style="color:#6c71e8;margin-right:6px">$1.</span>$2</h2>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:600;color:#e8eaf0;margin:18px 0 6px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:17px;font-weight:700;color:#e8eaf0;margin:0 0 8px">$1</h1>')
    .replace(/^- (.+?): (.+)$/gm, '<div style="display:flex;gap:6px;margin:3px 0;font-size:12px;line-height:1.6"><span style="color:#6c71e8;font-weight:500;flex-shrink:0;min-width:36px">$1</span><span style="color:#9096a8">$2</span></div>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:6px;margin:3px 0;font-size:12px;line-height:1.6"><span style="color:#6c71e8;flex-shrink:0">-</span><span style="color:#9096a8">$1</span></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8eaf0;font-weight:500">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #2e3440;margin:14px 0"/>')
    .replace(/\n\n/g, '<div style="height:4px"></div>')
    .replace(/\n/g, "");
}

export default function NewsClient({ agentId, latestOutput, latestDate }: Props) {
  const [output, setOutput] = useState(latestOutput);
  const [date, setDate] = useState(latestDate);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    if (!agentId || running) return;
    setRunning(true);
    setError("");
    try {
      const res = await nativeFetch("/api/execute", {
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
      <h1 className="page-title" style={{ marginBottom: 12 }}>AI News</h1>

      {agentId ? (
        <button
          onClick={handleRun}
          disabled={running}
          className="btn-add"
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 14,
            opacity: running ? 0.5 : 1,
          }}
        >
          {running ? "生成中..." : "最新ニュースを取得"}
        </button>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: 20 }}>
          <p style={{ color: "#9096a8", fontSize: 13, margin: "0 0 6px" }}>
            AIニュースエージェントが見つかりません
          </p>
          <a href="/store/" style={{ color: "#6c71e8", fontSize: 13, textDecoration: "none" }}>
            ストアから追加
          </a>
        </div>
      )}

      {error && (
        <div style={{
          background: "#1f1215",
          border: "1px solid #3d1c1c",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 10,
        }}>
          <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}

      {output ? (
        <div className="card" style={{ padding: 16 }}>
          {date && (
            <p style={{ fontSize: 11, color: "#4a5060", marginBottom: 10 }}>
              {formatDate(date)}
            </p>
          )}
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
        </div>
      ) : !error && agentId && (
        <div className="card" style={{ textAlign: "center", padding: 28 }}>
          <p style={{ color: "#4a5060", fontSize: 13, margin: 0 }}>
            ボタンを押して最新ニュースを取得してください
          </p>
        </div>
      )}
    </div>
  );
}