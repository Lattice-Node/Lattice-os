"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { nativeFetch } from "@/lib/native-fetch";

interface Memory {
  id: string;
  content: string;
  importance: number;
  createdAt: string;
}

export default function MemoriesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    nativeFetch(`/api/node/${id}/memories`)
      .then((r) => r.json())
      .then((data) => { setMemories(data.memories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="page">
      <button
        onClick={() => router.push(`/node/${id}`)}
        style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 12 }}
      >
        ← 戻る
      </button>
      <p className="page-label">記憶</p>
      <h1 className="page-title">Nodeの記憶</h1>

      {loading ? (
        <Loading />
      ) : memories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: 14, margin: 0 }}>まだ記憶がありません</p>
          <p style={{ fontSize: 12, margin: "8px 0 0", color: "var(--text-disabled)" }}>会話を重ねると、Nodeが情報を覚えていきます</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {memories.map((m) => (
            <div
              key={m.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < Math.ceil(m.importance / 2) ? "var(--accent)" : "var(--border)" }} />
                  ))}
                </div>
                <span style={{ fontSize: 10, color: "var(--text-disabled)" }}>
                  {new Date(m.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>
                {m.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
