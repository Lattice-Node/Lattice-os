"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Agent = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  trigger: string;
  triggerCron: string;
  connections: string;
  active: boolean;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [output, setOutput] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgent(data.agent);
        setEditName(data.agent?.name ?? "");
        setEditPrompt(data.agent?.prompt ?? "");
        setLoading(false);
      });
  }, [id]);

  async function handleToggleActive() {
    if (!agent) return;
    setSaving(true);
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !agent.active }),
    });
    const data = await res.json();
    setAgent(data.agent);
    setSaving(false);
  }

  async function handleSave() {
    if (!agent) return;
    setSaving(true);
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, prompt: editPrompt }),
    });
    const data = await res.json();
    setAgent(data.agent);
    setSaving(false);
  }

  async function handleRun() {
    setRunning(true);
    setOutput("");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: id, prompt: agent?.prompt }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value));
      }
    } catch {
      setOutput("実行中にエラーが発生しました");
    } finally {
      setRunning(false);
    }
  }

  async function handleDelete() {
    if (!confirm("このエージェントを削除しますか？")) return;
    setDeleting(true);
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    router.push("/agents");
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", paddingTop: 56 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
          <p style={{ color: "#333", fontSize: 14 }}>読み込み中...</p>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", paddingTop: 56 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
          <p style={{ color: "#555", fontSize: 14 }}>エージェントが見つかりません</p>
          <Link href="/agents" style={{ color: "#5b5fc7", fontSize: 13, textDecoration: "none" }}>← 一覧に戻る</Link>
        </div>
      </main>
    );
  }

  const changed = editName !== agent.name || editPrompt !== agent.prompt;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#e5e5e5", paddingTop: 56 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>Home</Link>
          <span style={{ color: "#2a2a2a", fontSize: 13 }}>/</span>
          <Link href="/agents" style={{ fontSize: 13, color: "#444", textDecoration: "none" }}>Agents</Link>
          <span style={{ color: "#2a2a2a", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: "#666", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name}</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#f0f0f0",
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                padding: 0,
                fontFamily: "inherit",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleToggleActive}
              disabled={saving}
              style={{
                padding: "7px 14px",
                borderRadius: 6,
                fontSize: 13,
                border: `1px solid ${agent.active ? "#1a3a1a" : "#1e1e1e"}`,
                background: "transparent",
                color: agent.active ? "#4ade80" : "#555",
                cursor: "pointer",
              }}
            >
              {agent.active ? "稼働中" : "停止中"}
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                background: running ? "#1a1a1a" : "#5b5fc7",
                color: running ? "#444" : "#fff",
                cursor: running ? "default" : "pointer",
              }}
            >
              {running ? "実行中..." : "▶ 実行"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 24 }}>
          {[
            { label: "実行回数", value: `${agent.runCount}回` },
            { label: "最終実行", value: agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleDateString("ja-JP") : "未実行" },
            { label: "作成日", value: new Date(agent.createdAt).toLocaleDateString("ja-JP") },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: "16px 20px" }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#e0e0e0", margin: "0 0 4px" }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#444", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Prompt editor */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Prompt
          </p>
          <div style={{ border: "1px solid #1a1a1a", borderRadius: 8, backgroundColor: "#111", overflow: "hidden" }}>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ccc",
                fontSize: 14,
                padding: "16px 18px",
                resize: "vertical",
                lineHeight: 1.7,
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Save */}
        {changed && (
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 18px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                background: "#5b5fc7",
                color: "#fff",
                cursor: saving ? "default" : "pointer",
              }}
            >
              {saving ? "保存中..." : "変更を保存"}
            </button>
          </div>
        )}

        {/* Output */}
        {output && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Output
            </p>
            <div style={{
              border: "1px solid #1a1a1a",
              borderRadius: 8,
              backgroundColor: "#0d0d0d",
              padding: "16px 18px",
              fontSize: 13,
              color: "#888",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
            }}>
              {output}
            </div>
          </div>
        )}

        {/* Trigger info */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Trigger
          </p>
          <div style={{ border: "1px solid #1a1a1a", borderRadius: 8, backgroundColor: "#111", padding: "14px 18px" }}>
            <span style={{ fontSize: 13, color: "#555" }}>
              {agent.trigger || "手動実行"}
              {agent.triggerCron && ` — ${agent.triggerCron}`}
            </span>
          </div>
        </div>

        {/* Delete */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 24 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              fontSize: 13,
              border: "1px solid #2a1a1a",
              background: "transparent",
              color: "#664444",
              cursor: deleting ? "default" : "pointer",
            }}
          >
            {deleting ? "削除中..." : "エージェントを削除"}
          </button>
        </div>
      </div>
    </main>
  );
}