"use client";

import Link from "next/link";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  trigger: string | null;
  triggerCron: string | null;
  runCount: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

function formatNextRun(next: string | null): string {
  if (!next) return "未設定";
  const d = new Date(next);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return "実行待ち";
  if (diff < 3600000) return Math.round(diff / 60000) + "分後";
  if (diff < 86400000) return "今日 " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
  return "明日 " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
}

export default function AgentsList({ agents }: { agents: Agent[] }) {
  const [items, setItems] = useState(agents);

  async function handleToggle(id: string, current: boolean) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, active: !current } : a)));
    try {
      await fetch("/api/agents/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !current }),
      });
    } catch {
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, active: current } : a)));
    }
  }

  if (items.length === 0) {
    return (
      <Link href="/store" className="empty-state" style={{ display: "block", textDecoration: "none" }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#6c71e8" strokeWidth="1.5" style={{ margin: "0 auto 4px", display: "block" }}>
          <path d="M14 6v16M6 14h16" />
        </svg>
        <p>ストアからエージェントを追加</p>
      </Link>
    );
  }

  return (
    <div>
      {items.map((agent, i) => (
        <div key={agent.id} className="card animate-in" style={{ animationDelay: i * 50 + "ms" }}>
          <div className="agent-header">
            <Link href={"/agents/" + agent.id} className="agent-info" style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
              <div className="agent-icon" style={{ background: "rgba(108, 113, 232, 0.12)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6c71e8" strokeWidth="1.6">
                  <rect x="2" y="3" width="14" height="12" rx="2" />
                  <path d="M2 7h14M7 7v8" />
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="agent-name">{agent.name}</p>
                <p className="agent-meta">次回: {formatNextRun(agent.nextRunAt)}</p>
              </div>
            </Link>
            <button className={"toggle " + (agent.active ? "on" : "off")} onClick={() => handleToggle(agent.id, agent.active)}>
              <div className="toggle-knob" />
            </button>
          </div>
          {agent.runCount > 0 && (
            <div className="card-inner">
              <p className="result-label">最新の実行結果</p>
              <p className="result-preview">{agent.description || "結果を取得中..."}</p>
            </div>
          )}
        </div>
      ))}
      <Link href="/store" className="empty-state animate-in" style={{ display: "block", textDecoration: "none", animationDelay: items.length * 50 + "ms" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c71e8" strokeWidth="1.5" style={{ margin: "0 auto 2px", display: "block" }}>
          <path d="M12 5v14M5 12h14" />
        </svg>
        <p>ストアからエージェントを追加</p>
      </Link>
    </div>
  );
}