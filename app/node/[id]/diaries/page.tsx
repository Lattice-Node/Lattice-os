"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";

interface Diary {
  id: string;
  content: string;
  createdAt: string;
}

export default function DiariesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/node/${id}/diaries`)
      .then((r) => r.json())
      .then((data) => { setDiaries(data.diaries || []); setLoading(false); })
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
      <p className="page-label">日記</p>
      <h1 className="page-title">Nodeの日記</h1>

      {loading ? (
        <Loading />
      ) : diaries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: 14, margin: 0 }}>まだ日記がありません</p>
          <p style={{ fontSize: 12, margin: "8px 0 0", color: "var(--text-disabled)" }}>会話を5往復以上すると、Nodeが日記を書き始めます</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {diaries.map((d) => (
            <div
              key={d.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px",
              }}
            >
              <p style={{ fontSize: 11, color: "var(--text-disabled)", margin: "0 0 10px", fontFamily: "'Space Mono', monospace" }}>
                {new Date(d.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
                {d.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
