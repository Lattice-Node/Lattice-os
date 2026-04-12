"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { nativeFetch } from "@/lib/native-fetch";
import FeedItemCard from "./FeedItemCard";

type FeedItem = {
  id: string;
  title: string;
  previewText: string;
  agentName: string;
  likeCount: number;
  viewCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string | null;
  };
};

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(async (cur?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cur) params.set("cursor", cur);
      const res = await nativeFetch(`/api/feed?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems((prev) => (cur ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
    } catch {
      console.error("[feed] load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleLikeToggle = (itemId: string, newState: boolean) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, isLikedByMe: newState, likeCount: it.likeCount + (newState ? 1 : -1) }
          : it
      )
    );
  };

  return (
    <main style={{ minHeight: "100%", paddingBottom: 20, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        <div className="feed-header">
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>FEED</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>フィード</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
          {items.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: "0 0 8px" }}>まだ投稿がありません</p>
              <p style={{ fontSize: 12, color: "var(--text-disabled)", margin: 0 }}>エージェントを公開すると、ここに表示されます</p>
            </div>
          )}

          {items.map((item) => (
            <Link key={item.id} href={`/feed/${item.id}`} prefetch={false} style={{ textDecoration: "none", color: "inherit" }}>
              <FeedItemCard
                item={item}
                onLikeToggle={(newState) => handleLikeToggle(item.id, newState)}
              />
            </Link>
          ))}

          {hasMore && !loading && (
            <button
              onClick={() => loadFeed(cursor)}
              style={{ margin: "16px auto", padding: "12px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
            >
              もっと見る
            </button>
          )}

          {loading && (
            <p style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)", fontSize: 13 }}>読み込み中...</p>
          )}
        </div>
      </div>
    </main>
  );
}
