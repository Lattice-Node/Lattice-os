"use client";

import { useState } from "react";
import Link from "next/link";

type InboxItem = {
  id: string;
  output: string;
  createdAt: string;
  agentId: string;
  agentName: string;
};

type AgentGroup = {
  agentId: string;
  agentName: string;
  items: InboxItem[];
};

type Screen =
  | { type: "top" }
  | { type: "agent-list"; filter: "today" | "past" }
  | { type: "agent-detail"; filter: "today" | "past"; group: AgentGroup }
  | { type: "article"; filter: "today" | "past"; group: AgentGroup; item: InboxItem };

function formatTime(iso: string) {
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
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:600;color:#e8eaf0;margin:14px 0 6px">$1</h3>')
    .replace(/^## (\d+)\. (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;color:#e8eaf0;margin:20px 0 6px"><span style="color:#6c71e8;margin-right:6px">$1.</span>$2</h2>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;color:#e8eaf0;margin:20px 0 6px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;color:#f0f2f8;margin:0 0 16px;letter-spacing:-0.02em">$1</h1>')
    .replace(/^- (.+?): (.+)$/gm, '<div style="display:flex;gap:8px;margin:4px 0;font-size:13px;line-height:1.6"><span style="color:#6c71e8;font-weight:500;flex-shrink:0;min-width:40px">$1</span><span style="color:#9096a8">$2</span></div>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;margin:4px 0;font-size:13px;line-height:1.6"><span style="color:#6c71e8;flex-shrink:0">-</span><span style="color:#9096a8">$1</span></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8eaf0;font-weight:600">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255, 255, 255, 0.09);margin:16px 0"/>')
    .replace(/\n\n/g, '<div style="height:8px"></div>')
    .replace(/\n/g, "");
}

function getPreview(text: string) {
  const clean = text.replace(/^#.+$/gm, "").replace(/^-.+$/gm, "").replace(/---/g, "").trim();
  const first = clean.split("\n").filter(Boolean)[0] || "";
  return first.length > 45 ? first.slice(0, 45) + "..." : first;
}

function isToday(iso: string) {
  const now = new Date();
  const d = new Date(iso);
  const offset = 9 * 60;
  const nowJST = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  const dJST = new Date(d.getTime() + (offset - d.getTimezoneOffset()) * 60000);
  return (
    nowJST.getFullYear() === dJST.getFullYear() &&
    nowJST.getMonth() === dJST.getMonth() &&
    nowJST.getDate() === dJST.getDate()
  );
}

function groupByAgent(items: InboxItem[]): AgentGroup[] {
  const map = new Map<string, AgentGroup>();
  for (const item of items) {
    if (!map.has(item.agentId)) {
      map.set(item.agentId, { agentId: item.agentId, agentName: item.agentName, items: [] });
    }
    map.get(item.agentId)!.items.push(item);
  }
  return Array.from(map.values());
}

const cardBtn: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "16px 18px",
  borderRadius: 10,
  border: "1px solid rgba(255, 255, 255, 0.09)",
  background: "#141416",
  color: "#e8eaf0",
  textAlign: "left",
  cursor: "pointer",
  fontFamily: "inherit",
  marginBottom: 10,
};

const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#4a5060",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
  padding: 0,
  marginBottom: 20,
};

export default function InboxList({ items }: { items: InboxItem[] }) {
  const [screen, setScreen] = useState<Screen>({ type: "top" });

  const todayItems = items.filter((i) => isToday(i.createdAt));
  const pastItems = items.filter((i) => !isToday(i.createdAt));

  // 画面1: トップ
  if (screen.type === "top") {
    return (
      <div className="page">
        <p className="page-label">受信箱</p>
        <h1 className="page-title">受信箱</h1>

        <button
          style={{ ...cardBtn, border: "1.5px solid #22c55e", background: "#0d1f14" }}
          onClick={() => setScreen({ type: "agent-list", filter: "today" })}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#f0f2f8" }}>今日の受信</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {todayItems.length > 0 && (
                <span style={{ fontSize: 12, color: "#22c55e", background: "#0a2a16", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
                  {todayItems.length}件
                </span>
              )}
              <span style={{ color: "#22c55e", fontSize: 18 }}>›</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#4a7060", margin: "4px 0 0" }}>
            過去24時間に届いた結果
          </p>
        </button>

        <button
          style={cardBtn}
          onClick={() => setScreen({ type: "agent-list", filter: "past" })}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>過去の受信</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {pastItems.length > 0 && (
                <span style={{ fontSize: 12, color: "#4a5060", background: "transparent", border: "1px solid rgba(255, 255, 255, 0.09)", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
                  {pastItems.length}件
                </span>
              )}
              <span style={{ color: "#4a5060", fontSize: 18 }}>›</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#6a7080", margin: "4px 0 0" }}>
            24時間より前の受信履歴
          </p>
        </button>

        {/* サマリーセクション */}
        <div style={{ marginTop: 24, background: "#141416", border: "1px solid rgba(255, 255, 255, 0.09)", borderRadius: 12, padding: "18px 20px" }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>
            今日の状況
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#e8eaf0", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                {todayItems.length}
              </p>
              <p style={{ fontSize: 11, color: "#4a5060", margin: 0 }}>今日の受信</p>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid rgba(255, 255, 255, 0.09)", borderRight: "1px solid rgba(255, 255, 255, 0.09)" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#e8eaf0", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                {groupByAgent(todayItems).length}
              </p>
              <p style={{ fontSize: 11, color: "#4a5060", margin: 0 }}>稼働エージェント</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: items.length > 0 ? "#e8eaf0" : "#4a5060", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                {items.length}
              </p>
              <p style={{ fontSize: 11, color: "#4a5060", margin: 0 }}>総受信数</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 画面2: エージェント一覧
  if (screen.type === "agent-list") {
    const filtered = screen.filter === "today" ? todayItems : pastItems;
    const groups = groupByAgent(filtered);
    const label = screen.filter === "today" ? "今日の受信" : "過去の受信";

    return (
      <div className="page">
        <button style={backBtn} onClick={() => setScreen({ type: "top" })}>
          ← 戻る
        </button>
        <p className="page-label">受信箱</p>
        <h1 className="page-title">{label}</h1>

        {groups.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 28 }}>
            <p style={{ color: "#4a5060", fontSize: 13, margin: "0 0 8px" }}>
              {screen.filter === "today" ? "今日の受信はまだありません" : "過去の受信はありません"}
            </p>
            <Link href="/agents" style={{ color: "#6c71e8", fontSize: 13, textDecoration: "none" }}>
              エージェントを実行する
            </Link>
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group.agentId}
              style={cardBtn}
              onClick={() => setScreen({ type: "agent-detail", filter: screen.filter, group })}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{group.agentName}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#6c71e8", background: "#1e2044", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
                    {group.items.length}件
                  </span>
                  <span style={{ color: "#4a5060", fontSize: 18 }}>›</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#6a7080", margin: "4px 0 0" }}>
                最終受信 {formatTime(group.items[0].createdAt)}
              </p>
            </button>
          ))
        )}
      </div>
    );
  }

  // 画面3: 受信一覧（カード式・タップで記事へ）
  if (screen.type === "agent-detail") {
    const { group, filter } = screen;
    return (
      <div className="page">
        <button style={backBtn} onClick={() => setScreen({ type: "agent-list", filter })}>
          ← 戻る
        </button>
        <p className="page-label">受信箱</p>
        <h1 className="page-title">{group.agentName}</h1>

        {group.items.map((item) => {
          const d = new Date(item.createdAt);
          const dateStr = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", weekday: "short" }).format(d);
          const timeStr = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" }).format(d);
          return (
            <button
              key={item.id}
              style={{ ...cardBtn, borderLeft: "4px solid #6c71e8", paddingLeft: 14, background: "#16182a" }}
              onClick={() => setScreen({ type: "article", filter, group, item })}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#e8eaf0", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {timeStr}
                  </span>
                  <span style={{ fontSize: 11, color: "#4a5060", marginLeft: 8 }}>{dateStr}</span>
                </div>
                <span style={{ color: "#4a5060", fontSize: 18, marginTop: 2 }}>›</span>
              </div>
              <p style={{ fontSize: 13, color: "#9096a8", margin: 0, lineHeight: 1.5 }}>
                {getPreview(item.output)}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  // 画面4: 記事全文（ブログ風・全画面）
  if (screen.type === "article") {
    const { group, filter, item } = screen;
    return (
      <div className="page">
        <button style={backBtn} onClick={() => setScreen({ type: "agent-detail", filter, group })}>
          ← 戻る
        </button>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "#6c71e8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {group.agentName}
          </span>
          <p style={{ fontSize: 11, color: "#4a5060", margin: "4px 0 0" }}>
            {formatTime(item.createdAt)}
          </p>
        </div>

        <div
          style={{ fontSize: 14, lineHeight: 1.8, color: "#9096a8" }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(item.output) }}
        />
      </div>
    );
  }

  return null;
}
