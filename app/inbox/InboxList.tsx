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

function formatDate(iso: string) {
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
  return first.length > 60 ? first.slice(0, 60) + "..." : first;
}

export default function InboxList({ items }: { items: InboxItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="page">
        <p className="page-label">INBOX</p>
        <h1 className="page-title">受信箱</h1>
        <div className="card" style={{ textAlign: "center", padding: 28 }}>
          <p style={{ color: "#4a5060", fontSize: 13, margin: "0 0 8px" }}>
            まだ結果がありません
          </p>
          <Link href="/agents" style={{ color: "#6c71e8", fontSize: 13, textDecoration: "none" }}>
            マイAgentからエージェントを実行
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <p className="page-label">INBOX</p>
      <h1 className="page-title">受信箱</h1>

      {items.map((item) => {
        const isOpen = expanded === item.id;
        return (
          <div
            key={item.id}
            className="card animate-in"
            style={{ cursor: "pointer", padding: isOpen ? 16 : 14 }}
            onClick={() => setExpanded(isOpen ? null : item.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen ? 10 : 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>
                    {item.agentName}
                  </span>
                  <span style={{ fontSize: 11, color: "#4a5060" }}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {!isOpen && (
                  <p style={{ fontSize: 12, color: "#9096a8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {getPreview(item.output)}
                  </p>
                )}
              </div>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                stroke="#4a5060" strokeWidth="1.5"
                style={{ flexShrink: 0, marginLeft: 8, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>

            {isOpen && (
              <div style={{ borderTop: "1px solid #2a2d35", paddingTop: 10 }}>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(item.output) }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}