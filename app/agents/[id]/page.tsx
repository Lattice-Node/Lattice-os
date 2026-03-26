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

type Log = {
  id: string;
  status: string;
  output: string;
  error: string;
  createdAt: string;
};

const BG = "#111318";
const CARD = "#1a1d24";
const BORDER = "#2a2d35";
const TEXT = "#e8eaf0";
const MUTED = "#9096a8";
const DIM = "#4a5060";
const ACCENT = "#6c71e8";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState<"success" | "error" | "">("");
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [savingSlack, setSavingSlack] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "logs">("settings");

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const a = data.agent;
        setAgent(a);
        setEditName(a?.name ?? "");
        setEditPrompt(a?.prompt ?? "");
        try {
          const conns = JSON.parse(a?.connections ?? "[]");
          const slack = Array.isArray(conns)
            ? conns.find((c: { type: string }) => c.type === "slack")
            : conns?.slack;
          setSlackWebhook(slack?.webhookUrl ?? slack?.config?.webhookUrl ?? "");
        } catch {}
        setLoading(false);
      });
    fetchLogs();
  }, [id]);

  async function fetchLogs() {
    try {
      const res = await fetch(`/api/agents/${id}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
      }
    } catch {}
  }

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
    setEditName(data.agent.name);
    setEditPrompt(data.agent.prompt);
    setSaving(false);
  }

  async function handleSaveSlack() {
    if (!agent || savingSlack) return;
    setSavingSlack(true);
    const connections = JSON.stringify([
      { type: "slack", action: "post", webhookUrl: slackWebhook, config: { webhookUrl: slackWebhook } }
    ]);
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connections }),
    });
    const data = await res.json();
    setAgent(data.agent);
    setSavingSlack(false);
  }

  async function handleRun() {
    setRunning(true);
    setOutput("");
    setOutputStatus("");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: id,
          agentName: agent?.name,
          agentPrompt: agent?.prompt,
          task: "今すぐタスクを実行してください",
        }),
      });
      const data = await res.json();
      setOutput(data.output || data.error || "実行完了");
      setOutputStatus(data.status === "error" ? "error" : "success");
      fetchLogs();
    } catch {
      setOutput("実行中にエラーが発生しました");
      setOutputStatus("error");
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
      <main style={{ minHeight: "100vh", backgroundColor: BG, paddingTop: 56 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}>
          <p style={{ color: DIM, fontSize: 13 }}>読み込み中...</p>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: BG, paddingTop: 56 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}>
          <p style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>エージェントが見つかりません</p>
          <Link href="/agents" style={{ color: ACCENT, fontSize: 13, textDecoration: "none" }}>← 一覧に戻る</Link>
        </div>
      </main>
    );
  }

  const changed = editName !== agent.name || editPrompt !== agent.prompt;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, paddingTop: 56 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 36 }}>
          <Link href="/" style={{ fontSize: 13, color: DIM, textDecoration: "none" }}>Home</Link>
          <span style={{ color: "#22252f", fontSize: 13 }}>/</span>
          <Link href="/agents" style={{ fontSize: 13, color: DIM, textDecoration: "none" }}>Agents</Link>
          <span style={{ color: "#22252f", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: MUTED, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.name}
          </span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{
              fontSize: 22, fontWeight: 700, color: "#f0f2f8",
              background: "transparent", border: "none", outline: "none",
              flex: 1, padding: 0, fontFamily: "inherit", letterSpacing: "-0.02em",
            }}
          />
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleToggleActive}
              disabled={saving}
              style={{
                padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                border: `1px solid ${agent.active ? "#1a3a22" : BORDER}`,
                background: "transparent",
                color: agent.active ? "#4ade80" : MUTED,
                cursor: "pointer",
              }}
            >
              {agent.active ? "● 稼働中" : "○ 停止中"}
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              style={{
                padding: "7px 18px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                border: "none",
                background: running ? CARD : ACCENT,
                color: running ? DIM : "#fff",
                cursor: running ? "default" : "pointer",
              }}
            >
              {running ? "実行中..." : "▶ 実行"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 28, marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${BORDER}` }}>
          {[
            { label: "実行回数", value: `${agent.runCount}回` },
            { label: "最終実行", value: agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleDateString("ja-JP") : "未実行" },
            { label: "作成日", value: new Date(agent.createdAt).toLocaleDateString("ja-JP") },
            { label: "トリガー", value: agent.trigger || "手動" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: "0 0 3px" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: DIM, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Output */}
        {output && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              background: CARD,
              border: `1px solid ${outputStatus === "error" ? "#3a1a1a" : "#1a3a22"}`,
              borderRadius: 8,
              padding: "14px 16px",
            }}>
              <p style={{ fontSize: 11, color: outputStatus === "error" ? "#f87171" : "#4ade80", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {outputStatus === "error" ? "エラー" : "実行完了"}
              </p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                {output}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${BORDER}` }}>
          {(["settings", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab ? ACCENT : "transparent"}`,
                color: activeTab === tab ? TEXT : DIM,
                cursor: "pointer",
                marginBottom: -1,
                fontFamily: "inherit",
              }}
            >
              {tab === "settings" ? "設定" : `ログ${logs.length > 0 ? ` (${logs.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            {/* Prompt */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: DIM, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                Prompt
              </p>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={6}
                style={{
                  width: "100%", background: CARD, border: `1px solid ${BORDER}`,
                  borderRadius: 8, outline: "none", color: MUTED, fontSize: 13,
                  padding: "14px 16px", resize: "vertical", lineHeight: 1.7,
                  boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
            </div>
            {changed && (
              <div style={{ marginBottom: 28, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "8px 18px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                    border: "none", background: ACCENT, color: "#fff",
                    cursor: saving ? "default" : "pointer",
                  }}
                >
                  {saving ? "保存中..." : "変更を保存"}
                </button>
              </div>
            )}

            {/* Slack Webhook */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, color: DIM, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                Slack連携
              </p>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, color: MUTED, margin: "0 0 10px" }}>
                    Incoming Webhook URL
                  </p>
                  <input
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    style={{
                      width: "100%", background: BG, border: `1px solid ${BORDER}`,
                      borderRadius: 6, outline: "none", color: TEXT, fontSize: 13,
                      padding: "10px 12px", boxSizing: "border-box", fontFamily: "monospace",
                    }}
                  />
                  <p style={{ fontSize: 11, color: DIM, margin: "8px 0 0", lineHeight: 1.6 }}>
                    SlackのApp設定 → Incoming Webhooks から取得できます
                  </p>
                </div>
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 16px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleSaveSlack}
                    disabled={savingSlack || !slackWebhook.trim()}
                    style={{
                      padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                      border: "none",
                      background: slackWebhook.trim() && !savingSlack ? ACCENT : "#1e2030",
                      color: slackWebhook.trim() && !savingSlack ? "#fff" : DIM,
                      cursor: slackWebhook.trim() && !savingSlack ? "pointer" : "default",
                    }}
                  >
                    {savingSlack ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            </div>

            {/* Delete */}
            <div style={{ paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
              <button
                onClick={handleDelete}
                style={{
                  padding: "7px 14px", borderRadius: 6, fontSize: 13,
                  border: "1px solid #2a1a1a", background: "transparent",
                  color: "#664444", cursor: "pointer",
                }}
              >
                エージェントを削除
              </button>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div>
            {logs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <p style={{ color: DIM, fontSize: 14, margin: 0 }}>まだ実行ログがありません</p>
                <p style={{ color: "#2a2d35", fontSize: 13, marginTop: 6 }}>「実行」ボタンを押すとログが記録されます</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {logs.map((log) => (
                  <div key={log.id} style={{
                    background: CARD, border: `1px solid ${BORDER}`,
                    borderRadius: 8, padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: log.status === "success" ? "#4ade80" : "#f87171",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {log.status === "success" ? "成功" : "エラー"}
                      </span>
                      <span style={{ fontSize: 11, color: DIM }}>
                        {new Date(log.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    {(log.output || log.error) && (
                      <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                        {log.output || log.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}