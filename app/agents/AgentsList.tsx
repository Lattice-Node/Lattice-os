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
    const steps = [
      { num: "1", title: "ストアからテンプレートを選ぶ", desc: "すぐに使えるAIエージェントのテンプレートが揃っています。" },
      { num: "2", title: "カスタマイズする", desc: "対象サイトやキーワードなど、あなたの用途に合わせて設定。" },
      { num: "3", title: "自動で動き続ける", desc: "スケジュール通りにAIが実行。結果はアプリに届きます。" },
    ];
    return (
      <div style={{ padding: "16px 0" }}>
        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 14, padding: "28px 20px", marginBottom: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", margin: "0 0 6px" }}>Lattice へようこそ</p>
          <p style={{ fontSize: 13, color: "#6a7080", margin: "0 0 20px", lineHeight: 1.6 }}>
            AIエージェントがあなたの代わりに情報収集や通知を自動で行います。
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s) => (
              <div key={s.num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(108,113,232,0.12)", border: "1px solid rgba(108,113,232,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 600, color: "#6c71e8" }}>{s.num}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0", margin: "0 0 2px" }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: "#6a7080", margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/store" style={{ display: "block", padding: "14px", borderRadius: 10, background: "#6c71e8", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
            ストアからエージェントを追加
          </Link>
          <Link href="/agents/new" style={{ display: "block", padding: "14px", borderRadius: 10, border: "1px solid #2e3440", background: "#1c2028", color: "#9096a8", fontSize: 14, textDecoration: "none", textAlign: "center" }}>
            自分でエージェントを作成する
          </Link>
        </div>
      </div>
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