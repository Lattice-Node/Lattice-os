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

function getDaysAlive(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function NodeClient({ nodes }: { nodes: Node[] }) {
  const router = useRouter();

  return (
    <div className="page">
      <p className="page-label">ノード</p>
      <h1 className="page-title">マイノード</h1>

      {nodes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-secondary)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-disabled)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: 16 }}
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>
            ノードがありません
          </p>
          <p style={{ fontSize: 13, margin: "0 0 24px" }}>
            ノードを作成して、あなたのネットワークを広げましょう
          </p>
          <button
            onClick={() => router.push("/node/new")}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ノードを作成
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button
              onClick={() => router.push("/node/new")}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + 新規作成
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {nodes.map((node) => {
              const days = getDaysAlive(node.createdAt);
              return (
                <div
                  key={node.id}
                  onClick={() => { hapticImpact("light"); router.push(`/node/${node.id}`); }}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "16px",
                    transition: "border-color 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: node.status === "active" ? "var(--success, #34d399)" : "var(--text-disabled)",
                          display: "inline-block",
                          boxShadow: node.status === "active" ? "0 0 6px var(--success, #34d399)" : "none",
                        }}
                      />
                      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                        {node.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--accent)",
                        background: "var(--surface-raised, var(--surface))",
                        padding: "2px 10px",
                        borderRadius: 999,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {days}日生存
                    </span>
                  </div>
                  {node.description && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      {node.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
