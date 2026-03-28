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
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;color:#e8eaf0;margin:10px 0 4px">$1</h3>')
    .replace(/^## (\d+)\. (.+)$/gm, '<h2 style="font-size:14px;font-weight:600;color:#e8eaf0;margin:14px 0 4px"><span style="color:#6c71e8;margin-right:4px">$1.</span>$2</h2>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;font-weight:600;color:#e8eaf0;margin:14px 0 4px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:16px;font-weight:700;color:#e8eaf0;margin:0 0 8px">$1</h1>')
    .replace(/^- (.+?): (.+)$/gm, '<div style="display:flex;gap:6px;margin:2px 0;font-size:12px;line-height:1.5"><span style="color:#6c71e8;font-weight:500;flex-shrink:0;min-width:32px">$1</span><span style="color:#9096a8">$2</span></div>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:6px;margin:2px 0;font-size:12px;line-height:1.5"><span style="color:#6c71e8;flex-shrink:0">-</span><span style="color:#9096a8">$1</span></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8eaf0;font-weight:500">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #2a2d35;margin:10px 0"/>')
    .replace(/\n\n/g, '<div style="height:4px"></div>')
    .replace(/\n/g, "");
}

function getPreview(text: string) {
  const clean = text.replace(/^#.+$/gm, "").replace(/^-.+$/gm, "").replace(/---/g, "").trim();
  const first = clean.split("\n").filter(Boolean)[0] || "";
  return first.length > 50 ? first.slice(0, 50) + "..." : first;
}

function isToday(iso: string) {
  const now = new Date();
  const d = new Date(iso);
  const jstOffset = 9 * 60;
  const nowJST = new Date(now.getTime() + (jstOffset - now.getTimezoneOffset()) * 60000);
  const dJST = new Date(d.getTime() + (jstOffset - d.getTimezoneOffset()) * 60000);
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

function AgentGroupCard({ group }: { group: AgentGroup }) {
  const [open, setOpen] = useState(false);
  const latest = group.items[0];

  return (
    <div style={{ border: "1px solid #2a2d35", borderRadius: 10, backgroundColor: "#1a1d24", overflow: "hidden", marginBottom: 10 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>
              {group.agentName}
            </span>
            <span style={{ fontSize: 11, color: "#6c71e8", background: "#1e2044", padding: "1px 7px", borderRadius: 4, fontWeight: 500 }}>
              {group.items.length}件
            </span>
          </div>
          {!open && (
            <p style={{ fontSize: 12, color: "#6a7080", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getPreview(latest.output)}
            </p>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke="#4a5060" strokeWidth="1.5"
          style={{ flexShrink: 0, marginLeft: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #22252f" }}>
          {group.items.map((item, i) => (
            <div
              key={item.id}
              style={{
                padding: "12px 16px",
                borderBottom: i < group.items.length - 1 ? "1px solid #22252f" : "none",
              }}
            >
              <p style={{ fontSize: 11, color: "#4a5060", margin: "0 0 8px" }}>
                {formatTime(item.createdAt)}
              </p>
              <div
                style={{ fontSize: 12, color: "#9096a8", lineHeight: 1.65 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item.output) }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InboxList({ items }: { items: InboxItem[] }) {
  const [tab, setTab] = useState<"today" | "past">("today");

  const todayItems = items.filter((i) => isToday(i.createdAt));
  const pastItems = items.filter((i) => !isToday(i.createdAt));

  const todayGroups = groupByAgent(todayItems);
  const pastGroups = groupByAgent(pastItems);

  const currentGroups = tab === "today" ? todayGroups : pastGroups;
  const currentItems = tab === "today" ? todayItems : pastItems;

  return (
    <div className="page">
      <p className="page-label">受信箱</p>
      <h1 className="page-title">受信箱</h1>

      {/* タブ */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["today", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              border: "1px solid",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              borderColor: tab === t ? "#6c71e8" : "#2a2d35",
              background: tab === t ? "#1e2044" : "transparent",
              color: tab === t ? "#6c71e8" : "#6a7080",
            }}
          >
            {t === "today" ? `今日（${todayItems.length}）` : `過去（${pastItems.length}）`}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {currentItems.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 28 }}>
          <p style={{ color: "#4a5060", fontSize: 13, margin: "0 0 8px" }}>
            {tab === "today" ? "今日の受信はまだありません" : "過去の受信はありません"}
          </p>
          <Link href="/agents" style={{ color: "#6c71e8", fontSize: 13, textDecoration: "none" }}>
            エージェントを実行する
          </Link>
        </div>
      ) : (
        currentGroups.map((group) => (
          <AgentGroupCard key={group.agentId} group={group} />
        ))
      )}
    </div>
  );
}
