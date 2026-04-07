"use client";

import { useRouter } from "next/navigation";
import { hapticImpact } from "@/lib/native";

interface Node {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Diary {
  id: string;
  content: string;
  createdAt: string;
}

interface Exchange {
  id: string;
  userMessage: string;
  nodeResponse: string;
  createdAt: string;
}

interface Props {
  node: Node;
  memoryCount: number;
  exchangeCount: number;
  latestDiary: Diary | null;
  recentExchanges: Exchange[];
}

function getDaysAlive(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "16px",
  marginBottom: 10,
};

export default function NodeDetailClient({ node, memoryCount, exchangeCount, latestDiary, recentExchanges }: Props) {
  const router = useRouter();
  const days = getDaysAlive(node.createdAt);

  return (
    <div className="page">
      <button
        onClick={() => router.push("/node")}
        style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 12 }}
      >
        ← ノード一覧
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: node.status === "active" ? "var(--success, #34d399)" : "var(--text-disabled)", boxShadow: node.status === "active" ? "0 0 8px var(--success, #34d399)" : "none" }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-display)", margin: 0 }}>{node.name}</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>
        {days}日生存 &middot; {exchangeCount}回の会話
      </p>

      {node.description && (
        <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 20px" }}>
          {node.description}
        </p>
      )}

      <button
        onClick={() => { hapticImpact("medium"); router.push(`/node/talk/?id=${node.id}`); }}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 999,
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          marginBottom: 24,
        }}
      >
        話しかける
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div onClick={() => router.push(`/node/memories/?id=${node.id}`)} style={{ ...card, cursor: "pointer" }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", margin: "0 0 4px" }}>{memoryCount}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>記憶</p>
        </div>
        <div onClick={() => router.push(`/node/diaries/?id=${node.id}`)} style={{ ...card, cursor: "pointer" }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>{latestDiary ? "1+" : "0"}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>日記</p>
        </div>
      </div>

      {latestDiary && (
        <div style={card}>
          <p style={{ fontSize: 11, color: "var(--text-disabled)", margin: "0 0 8px", fontFamily: "'Space Mono', monospace" }}>
            最新の日記 &middot; {new Date(latestDiary.createdAt).toLocaleDateString("ja-JP")}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, margin: 0 }}>
            {latestDiary.content}
          </p>
        </div>
      )}

      {/* 過去の会話 */}
      {recentExchanges.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
            過去の会話
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentExchanges.map((ex) => (
              <div key={ex.id} style={{ ...card, marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>{timeAgo(ex.createdAt)}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px", lineHeight: 1.5 }}>
                  {ex.userMessage.length > 60 ? ex.userMessage.slice(0, 60) + "..." : ex.userMessage}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                  {ex.nodeResponse.length > 80 ? ex.nodeResponse.slice(0, 80) + "..." : ex.nodeResponse}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
