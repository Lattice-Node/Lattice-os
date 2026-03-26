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
    if (!agent || saving) return;
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
    if (!agent || saving) return;
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
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    router.push("/agents");
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", paddingTop: 56 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#222", animation: "pulse 1s infinite" }} />
            <p style={{ color: "#333", fontSize: 13, margin: 0 }}>読み込み中</p>
          </div>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", paddingTop: 56 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>エージェントが見つかりません</p>
          <Link href="/agents" style={{ color: "#5b5fc7", fontSize: 13, textDecoration: "none" }}>← 一覧に戻る</Link>
        </div>
      </main>
    );
  }

  const changed = editName !== agent.name || editPrompt !== agent.prompt;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#e5e5e5", paddingTop: 56 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 40 }}>
          <Link href="/" style={{ fontSize: 13, color: "#333", textDecoration: "none" }}>Home</Link>
          <span style={{ color: "#222", fontSize: 13 }}>/</span>
          <Link href="/agents" style={{ fontSize: 13, color: "#333", textDecoration: "none" }}>Agents</Link>
          <span style={{ color: "#222", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: "#555", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.name}
          </span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, gap: 16 }}>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f0f0f0",
              background: "transparent",
              border: "none",
              outline: "none",
              flex: 1,
              padding: 0,
              fontFamily: "inherit",
              letterSpacing: "-0.02em",
            }}
          />
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleToggleActive}
              disabled={saving}
              style={{
                padding: "7px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${agent.active ? "#1a3a1a" : "#1e1e1e"}`,
                background: "transparent",
                color: agent.active ? "#4ade80" : "#444",
                cursor: "pointer",
              }}
            >
              {agent.active ? "● 稼働中" : "○ 停止中"}
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
                background: running ? "#111" : "#5b5fc7",
                color: running ? "#444" : "#fff",
                cursor: running ? "default" : "pointer",
              }}
            >
              {running ? "実行中..." : "▶ 実行"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24, marginBottom: 36, paddingBottom: 24, borderBottom: "1px solid #141414" }}>
          {[
            { label: "実行回数", value: `${agent.runCount}回` },
            { label: "最終実行", value: agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleDateString("ja-JP") : "未実行" },
            { label: "作成日", value: new Date(agent.createdAt).toLocaleDateString("ja-JP") },
            { label: "トリガー", value: agent.trigger || "手動" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#ccc", margin: "0 0 3px" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "#3a3a3a", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
            Prompt
          </p>
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            rows={6}
            style={{
              width: "100%",
              background: "#111",
              border: "1px solid #1a1a1a",
              borderRadius: 8,
              outline: "none",
              color: "#bbb",
              fontSize: 14,
              padding: "16px",
              resize: "vertical",
              lineHeight: 1.7,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Save button */}
        {changed && (
          <div style={{ marginBottom: 28, display: "flex", justifyContent: "flex-end" }}>
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
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
              Output
            </p>
            <div style={{
              background: "#0d0d0d",
              border: "1px solid #1a1a1a",
              borderRadius: 8,
              padding: "16px",
              fontSize: 13,
              color: "#777",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
            }}>
              {output}
            </div>
          </div>
        )}

        {/* Delete */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #141414" }}>
          <button
            onClick={handleDelete}
            style={{
              padding: "7px 14px",
              borderRadius: 6,
              fontSize: 13,
              border: "1px solid #1e1212",
              background: "transparent",
              color: "#553333",
              cursor: "pointer",
            }}
          >
            エージェントを削除
          </button>
        </div>
      </div>
    </main>
  );
}