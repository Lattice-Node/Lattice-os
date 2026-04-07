"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";

export default function NewNodeClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("ノード名を入力してください");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await nativeFetch("/api/node", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "作成に失敗しました");
      setSubmitting(false);
      return;
    }

    router.push("/node/");
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid var(--border-visible)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div className="page">
      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
          padding: "8px 0",
          marginBottom: 12,
        }}
      >
        ← 戻る
      </button>

      <p className="page-label">ノード</p>
      <h1 className="page-title">ノードを作成</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            ノード名 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: マーケティング分析"
            style={inputStyle}
            maxLength={50}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ノードの目的や用途を記述..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            maxLength={200}
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--accent)", margin: 0 }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: 999,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: submitting ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {submitting ? "作成中..." : "ノードを作成"}
        </button>
      </div>
    </div>
  );
}
