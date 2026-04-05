"use client";

import { useRouter } from "next/navigation";

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

interface Props {
  node: Node;
  memoryCount: number;
  messageCount: number;
  latestDiary: Diary | null;
}

function getDaysAlive(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "16px",
  marginBottom: 10,
};

export default function NodeDetailClient({ node, memoryCount, messageCount, latestDiary }: Props) {
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
        {days}日生存 &middot; {messageCount}回の会話
      </p>

      {node.description && (
        <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 20px" }}>
          {node.description}
        </p>
      )}

      <button
        onClick={() => router.push(`/node/${node.id}/chat`)}
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
        <div
          onClick={() => router.push(`/node/${node.id}/memories`)}
          style={{ ...card, cursor: "pointer" }}
        >
          <p style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", margin: "0 0 4px" }}>{memoryCount}</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>記憶</p>
        </div>
        <div
          onClick={() => router.push(`/node/${node.id}/diaries`)}
          style={{ ...card, cursor: "pointer" }}
        >
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
    </div>
  );
}
