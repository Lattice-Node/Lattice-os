"use client";

import Link from "next/link";
import { useState } from "react";
import { nativeFetch } from "@/lib/native-fetch";

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
  const hm = d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0"); const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999); if (d <= todayEnd) return "\u4eca\u65e5 " + hm; const tomorrowEnd = new Date(now); tomorrowEnd.setDate(tomorrowEnd.getDate() + 1); tomorrowEnd.setHours(23,59,59,999); if (d <= tomorrowEnd) return "\u660e\u65e5 " + hm; return (d.getMonth()+1) + "/" + d.getDate() + " " + hm;
  return "--";
}

export default function AgentsList({ agents }: { agents: Agent[] }) {
  const [items, setItems] = useState(agents);

  async function handleToggle(id: string, current: boolean) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, active: !current } : a)));
    try {
      await nativeFetch("/api/agents/" + id, {
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
      <div style={{ padding: "16px 0" }}>
        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 14, padding: "28px 20px", marginBottom: 16 }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#e8eaf0", margin: "0 0 6px" }}>Lattice へようこそ</p>
          <p style={{ fontSize: 14, color: "#9096a8", margin: "0 0 24px", lineHeight: 1.6 }}>
            1タップでAIエージェントが動き出します
          </p>

          {/* 3-step visual */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s === 1 ? "#6c71e8" : "#2e3440" }} />
            ))}
          </div>

          {/* Step cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#0e1117", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(108,113,232,0.2)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(108,113,232,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                1
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0", margin: "0 0 2px" }}>テンプレートを選ぶ</p>
                <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>1タップですぐに使えるAIエージェント</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#0e1117", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(108,113,232,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, color: "#6a7080" }}>
                2
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#9096a8", margin: "0 0 2px" }}>結果を確認する</p>
                <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>AIがWeb検索して自動で要約・分析</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#0e1117", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(108,113,232,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, color: "#6a7080" }}>
                3
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#9096a8", margin: "0 0 2px" }}>毎日自動で届く</p>
                <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>あなたは結果を見るだけ</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/store/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px", borderRadius: 12, background: "#6c71e8", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ストアからエージェントを選ぶ
          </Link>
          <Link href="/agents/new/" style={{ display: "block", padding: "14px", borderRadius: 12, border: "1px solid #2e3440", background: "#1c2028", color: "#9096a8", fontSize: 14, textDecoration: "none", textAlign: "center" }}>
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
            <Link href={`/agents/detail/?id=${agent.id}`} className="agent-info" style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
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
      <Link href="/store/" className="empty-state animate-in" style={{ display: "block", textDecoration: "none", animationDelay: items.length * 50 + "ms" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c71e8" strokeWidth="1.5" style={{ margin: "0 auto 2px", display: "block" }}>
          <path d="M12 5v14M5 12h14" />
        </svg>
        <p>ストアからエージェントを追加</p>
      </Link>
    </div>
  );
}
