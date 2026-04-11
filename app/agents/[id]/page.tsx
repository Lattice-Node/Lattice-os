"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { nativeFetch } from "@/lib/native-fetch";

type Agent = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  trigger: string;
  triggerCron: string;
  active: boolean;
  isPublic: boolean;
  publicUseCount: number;
  runCount: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
};

type Log = {
  id: string;
  status: string;
  output: string;
  error: string;
  createdAt: string;
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState<"success" | "error" | "">(
    ""
  );
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    nativeFetch(`/api/agents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgent(data.agent);
        setLoading(false);
      });
    fetchLogs();
  }, [id]);

  async function fetchLogs() {
    try {
      const res = await nativeFetch(`/api/agents/${id}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
      }
    } catch {}
  }

  async function handleToggleActive() {
    if (!agent) return;
    const res = await nativeFetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !agent.active }),
    });
    const data = await res.json();
    setAgent(data.agent);
  }

  async function handleTogglePublic() {
    if (!agent) return;
    if (!agent.isPublic) {
      setShowPublishConfirm(true);
      return;
    }
    await doTogglePublic(false);
  }
  async function doTogglePublic(isPublic: boolean) {
    const res = await nativeFetch("/api/agents/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic }),
    });
    const data = await res.json();
    setAgent(data.agent);
  }

  async function handleRun() {
    setRunning(true);
    setOutput("");
    setOutputStatus("");
    try {
      const res = await nativeFetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: id }),
      });
      const data = await res.json();
      setOutput(data.output || data.error || "完了");
      setOutputStatus(data.ok ? "success" : "error");
      fetchLogs();
    } catch {
      setOutput("エラー");
      setOutputStatus("error");
    } finally {
      setRunning(false);
    }
  }

  async function handleEdit() {
    if (!agent) return;
    setEditName(agent.name);
    setEditDesc(agent.description || "");
    setEditing(true);
  }
  async function handleSave() {
    const res = await nativeFetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    const data = await res.json();
    setAgent(data.agent);
    setEditing(false);
  }
  async function handleDelete() {
    if (!confirm("このエージェントを削除しますか？")) return;
    await nativeFetch(`/api/agents/${id}`, { method: "DELETE" });
    router.push("/agents/");
  }

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 24 }}>
        <p style={{ color: "var(--text-disabled)", fontSize: 13 }}>読み込み中...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="page" style={{ paddingTop: 24 }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>
          エージェントが見つかりません
        </p>
        <Link
          href="/agents/"
          style={{ color: "var(--btn-bg)", fontSize: 13, textDecoration: "none" }}
        >
          戻る
        </Link>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="page" style={{ paddingTop: 16 }}>
        <button onClick={() => setEditing(false)} style={{ fontSize: 13, color: "var(--text-disabled)", background: "transparent", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, fontFamily: "inherit" }}>&larr; キャンセル</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px" }}>エージェントを編集</h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px" }}>名前</p>
        <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "var(--text-primary)", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 16, outline: "none" }} />
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px" }}>説明</p>
        <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "var(--text-primary)", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 20, outline: "none", resize: "none" }} />
        <button onClick={handleSave} style={{ width: "100%", padding: 14, borderRadius: 10, background: "var(--btn-bg)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>保存する</button>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 16 }}>
      <Link
        href="/agents/"
        style={{
          fontSize: 13,
          color: "var(--text-disabled)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        &larr; 戻る
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: 0,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {agent.name}
        </h1>
        <button onClick={handleEdit} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", marginLeft: 8, fontFamily: "inherit", flexShrink: 0 }}>編集</button>
        <button
          className={"toggle " + (agent.active ? "on" : "off")}
          onClick={handleToggleActive}
          style={{ flexShrink: 0, marginLeft: 8 }}
        >
          <div className="toggle-knob" />
        </button>
      </div>


      {agent.description && (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            margin: "0 0 16px",
            lineHeight: 1.5,
          }}
        >
          {agent.description}
        </p>
      )}

      {/* Publish toggle */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px",
        background: agent.isPublic ? "rgba(108,113,232,0.08)" : "var(--surface)",
        border: agent.isPublic ? "1px solid rgba(108,113,232,0.3)" : "1px solid var(--border)",
        borderRadius: 10, marginBottom: 16, transition: "all 0.2s",
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: agent.isPublic ? "var(--btn-bg)" : "var(--text-secondary)", margin: "0 0 2px" }}>
            {agent.isPublic ? "\u516C\u958B\u4E2D" : "\u975E\u516C\u958B"}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
            {agent.isPublic
              ? "実行結果がフィードに自動投稿されます"
              : "公開すると実行結果がフィードに投稿されます"}
          </p>
        </div>
        <button onClick={handleTogglePublic} style={{
          padding: "6px 14px", borderRadius: 8,
          border: agent.isPublic ? "1px solid rgba(108,113,232,0.3)" : "1px solid var(--border)",
          background: agent.isPublic ? "transparent" : "var(--btn-bg)",
          color: agent.isPublic ? "var(--btn-bg)" : "#fff",
          fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: 12,
        }}>
          {agent.isPublic ? "\u975E\u516C\u958B\u306B\u3059\u308B" : "\u516C\u958B\u3059\u308B"}
        </button>
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-box">
          <p className="stat-number">{agent.runCount}</p>
          <p className="stat-label">実行回数</p>
        </div>
        <div className="stat-box">
          <p className="stat-number" style={{ fontSize: 16 }}>
            {agent.lastRunAt
              ? new Date(agent.lastRunAt).toLocaleDateString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                })
              : "--"}
          </p>
          <p className="stat-label">最終実行</p>
        </div>
        <div className="stat-box">
          <p className="stat-number" style={{ fontSize: 14 }}>
              {agent.nextRunAt ? (() => { const d = new Date(agent.nextRunAt!); const now = new Date(); const diff = d.getTime() - now.getTime(); const hm = d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0"); const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999); const tomorrowEnd = new Date(now); tomorrowEnd.setDate(tomorrowEnd.getDate()+1); tomorrowEnd.setHours(23,59,59,999); if (diff < 0) return "実行待ち"; if (d <= todayEnd) return "今日 "+hm; if (d <= tomorrowEnd) return "明日 "+hm; return (d.getMonth()+1)+"/"+d.getDate()+" "+hm; })() : "--"}
          </p>
          <p className="stat-label">次回実行</p>
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="btn-add"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          fontSize: 14,
          marginBottom: 16,
          opacity: running ? 0.5 : 1,
        }}
      >
        {running ? "実行中..." : "今すぐ実行"}
      </button>

      {output && (
        <div
          className="card"
          style={{
            borderColor:
              outputStatus === "error" ? "#3d1c1c" : "#1a3a22",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color:
                outputStatus === "error" ? "var(--accent)" : "var(--success)",
              margin: "0 0 6px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            {outputStatus === "error" ? "エラー" : "完了"}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {output.length > 500 ? output.slice(0, 500) + "..." : output}
          </p>
        </div>
      )}

      <p
        className="section-label"
        style={{ marginTop: 8, marginBottom: 8 }}
      >
        実行ログ
      </p>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 24 }}>
          <p style={{ color: "var(--text-disabled)", fontSize: 13, margin: 0 }}>
            まだログがありません
          </p>
        </div>
      ) : (
        logs.slice(0, 5).map((log) => (
          <div key={log.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color:
                    log.status === "success" ? "var(--success)" : "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {log.status === "success" ? "OK" : "ERR"}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>
                {new Date(log.createdAt).toLocaleString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {(log.output || log.error) && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {log.output || log.error}
              </p>
            )}
          </div>
        ))
      )}

      <button
        onClick={handleDelete}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 8,
          fontSize: 13,
          border: "1px solid #2a1a1a",
          background: "transparent",
          color: "#664444",
          cursor: "pointer",
          marginTop: 16,
          fontFamily: "inherit",
        }}
      >
        エージェントを削除
      </button>

      {/* Publish confirmation modal */}
      {showPublishConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowPublishConfirm(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-display)", margin: "0 0 16px" }}>このエージェントを公開しますか?</h2>
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 8px" }}>公開すると、以下のことが起こります:</p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>実行結果が全ユーザーのフィードに表示されます</li>
                <li>あなたのアイコンと表示名が一緒に表示されます</li>
                <li>他のユーザーがいいねできます</li>
              </ul>
            </div>
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
              <p style={{ fontWeight: 700, color: "#ef4444", margin: "0 0 4px" }}>注意</p>
              <p style={{ color: "var(--text-primary)", margin: 0 }}>個人情報（メールアドレス、電話番号、本名など）を扱うエージェントは公開しないでください。</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowPublishConfirm(false)} style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 600, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
              <button onClick={async () => { await doTogglePublic(true); setShowPublishConfirm(false); }} style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 600, border: "none", background: "var(--btn-bg)", color: "var(--btn-text)", cursor: "pointer", fontFamily: "inherit" }}>公開する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
