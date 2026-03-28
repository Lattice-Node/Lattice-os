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

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState<"success" | "error" | "">(
    ""
  );

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgent(data.agent);
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
    if (!agent) return;
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !agent.active }),
    });
    const data = await res.json();
    setAgent(data.agent);
  }

  async function handleRun() {
    setRunning(true);
    setOutput("");
    setOutputStatus("");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: id }),
      });
      const data = await res.json();
      setOutput(data.output || data.error || "Done");
      setOutputStatus(data.ok ? "success" : "error");
      fetchLogs();
    } catch {
      setOutput("Error");
      setOutputStatus("error");
    } finally {
      setRunning(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this agent?")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    router.push("/agents");
  }

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 24 }}>
        <p style={{ color: "#4a5060", fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="page" style={{ paddingTop: 24 }}>
        <p style={{ color: "#9096a8", fontSize: 14, marginBottom: 12 }}>
          Agent not found
        </p>
        <Link
          href="/agents"
          style={{ color: "#6c71e8", fontSize: 13, textDecoration: "none" }}
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 16 }}>
      <Link
        href="/agents"
        style={{
          fontSize: 13,
          color: "#4a5060",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        &larr; Back
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
            color: "#e8eaf0",
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
        <button
          className={"toggle " + (agent.active ? "on" : "off")}
          onClick={handleToggleActive}
          style={{ flexShrink: 0, marginLeft: 12 }}
        >
          <div className="toggle-knob" />
        </button>
      </div>

      {agent.description && (
        <p
          style={{
            fontSize: 13,
            color: "#9096a8",
            margin: "0 0 16px",
            lineHeight: 1.5,
          }}
        >
          {agent.description}
        </p>
      )}

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-box">
          <p className="stat-number">{agent.runCount}</p>
          <p className="stat-label">Total runs</p>
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
          <p className="stat-label">Last run</p>
        </div>
        <div className="stat-box">
          <p className="stat-number" style={{ fontSize: 16 }}>
            {agent.trigger || "manual"}
          </p>
          <p className="stat-label">Trigger</p>
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
        {running ? "Executing..." : "Execute now"}
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
                outputStatus === "error" ? "#f87171" : "#4ade80",
              margin: "0 0 6px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            {outputStatus === "error" ? "Error" : "Done"}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#9096a8",
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
        Recent logs
      </p>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 24 }}>
          <p style={{ color: "#4a5060", fontSize: 13, margin: 0 }}>
            No logs yet
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
                    log.status === "success" ? "#4ade80" : "#f87171",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {log.status === "success" ? "OK" : "ERR"}
              </span>
              <span style={{ fontSize: 11, color: "#4a5060" }}>
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
                  color: "#9096a8",
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
        Delete agent
      </button>
    </div>
  );
}