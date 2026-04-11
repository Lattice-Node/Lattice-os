"use client";

import { useEffect, useState } from "react";
import { nativeFetch } from "@/lib/native-fetch";

type MyAgent = {
  id: string;
  name: string;
  isPublic: boolean;
  publishedItemCount: number;
  totalLikes: number;
  totalViews: number;
};

type MyPost = {
  id: string;
  agentName: string;
  resultText: string;
  likeCount: number;
  viewCount: number;
  createdAt: string;
};

export default function MyFeedPage() {
  const [agents, setAgents] = useState<MyAgent[]>([]);
  const [items, setItems] = useState<MyPost[]>([]);
  const [tab, setTab] = useState<"agents" | "posts">("agents");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/my-feed")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) { setAgents(d.agents || []); setItems(d.items || []); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublic = async (agentId: string, current: boolean) => {
    const res = await nativeFetch(`/api/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !current }),
    });
    if (res.ok) {
      setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, isPublic: !current } : a)));
    }
  };

  const handleDeletePost = async (itemId: string) => {
    if (!confirm("この投稿を削除しますか?")) return;
    const res = await nativeFetch(`/api/my-feed/${itemId}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (loading) return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: 10, background: active ? "var(--bg)" : "transparent", border: "none",
    color: active ? "var(--text-primary)" : "var(--text-secondary)", fontSize: 14, fontWeight: 600,
    borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
  });

  return (
    <main style={{ minHeight: "100%", paddingBottom: 20, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 0" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>MY FEED</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>マイフィード</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>公開エージェントと投稿の管理</p>

        <div style={{ display: "flex", gap: 4, background: "var(--surface)", padding: 4, borderRadius: 12, marginBottom: 20 }}>
          <button onClick={() => setTab("agents")} style={tabStyle(tab === "agents")}>エージェント</button>
          <button onClick={() => setTab("posts")} style={tabStyle(tab === "posts")}>投稿履歴</button>
        </div>

        {tab === "agents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {agents.length === 0 ? (
              <p style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>エージェントがありません</p>
            ) : agents.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{a.name}</p>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      {a.totalLikes}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {a.totalViews}
                    </span>
                    <span>{a.publishedItemCount} 投稿</span>
                  </div>
                </div>
                <button
                  className={"toggle " + (a.isPublic ? "on" : "off")}
                  onClick={() => handleTogglePublic(a.id, a.isPublic)}
                  style={{ flexShrink: 0, marginLeft: 12 }}
                >
                  <div className="toggle-knob" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "posts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 8px" }}>まだ投稿がありません</p>
                <p style={{ fontSize: 12, color: "var(--text-disabled)", margin: 0 }}>エージェントを公開すると、ここに投稿が蓄積されます</p>
              </div>
            ) : items.map((item) => (
              <div key={item.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: "var(--accent)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", margin: 0 }}>{item.agentName}</p>
                  <button onClick={() => handleDeletePost(item.id)} style={{ background: "none", border: "none", color: "var(--text-disabled)", padding: 4, cursor: "pointer" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.resultText}
                </p>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    {item.likeCount}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {item.viewCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
