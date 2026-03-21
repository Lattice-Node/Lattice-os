"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Nav from "@/components/Nav";

const CATEGORIES = ["Writing", "Business", "Code", "Research", "Finance", "Legal", "Medical", "Custom"];

export default function PublishPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Writing",
    prompt: "",
    price: 0,
  });

  function update(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    if (!session) { signIn("github"); return; }
    if (!form.name || !form.description || !form.prompt) {
      alert("名前・説明・プロンプトは必須です");
      return;
    }
    setLoading(true);
    try {
      const defaultField = JSON.stringify([{
        id: "input",
        label: "入力",
        type: "textarea",
        placeholder: "ここに入力してください",
        options: "",
        required: true,
      }]);
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          prompt: form.prompt,
          agentType: "prompt",
          webhookUrl: "",
          authorName: session.user?.name ?? "anonymous",
          price: form.price,
          fields: defaultField,
        }),
      });
      const data = await res.json();
      if (data.success) router.push(`/apps/${data.agent.id}`);
      else alert("エラー: " + data.error);
    } catch {
      alert("送信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6 }}>プロンプトを出品する</h1>
          <p style={{ color: "#8b92a9", fontSize: 14 }}>あなたのプロンプトをLatticeで販売・公開しましょう。収益の80%を受け取れます。</p>
        </div>

        {!session && (
          <div style={{ background: "#1a1e2e", border: "1px solid #2a3050", borderRadius: 12, padding: "18px 22px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "#8b92a9" }}>出品するにはログインが必要です</span>
            <button onClick={() => signIn("github")} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>GitHubでログイン</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8b92a9", marginBottom: 8 }}>プロンプト名 *</label>
            <input
              type="text"
              placeholder="例: 競合分析プロンプト"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              style={{ width: "100%", background: "#0d1120", border: "1px solid #1c2136", borderRadius: 10, padding: "12px 16px", color: "#e8eaf0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8b92a9", marginBottom: 8 }}>説明 *</label>
            <textarea
              placeholder="例: 競合他社を分析して、強み・弱み・機会・脅威をまとめます"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              style={{ width: "100%", background: "#0d1120", border: "1px solid #1c2136", borderRadius: 10, padding: "12px 16px", color: "#e8eaf0", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8b92a9", marginBottom: 8 }}>カテゴリ *</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => update("category", cat)} style={{
                  padding: "7px 14px", borderRadius: 100, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${form.category === cat ? "#3b82f6" : "#1c2136"}`,
                  background: form.category === cat ? "#3b82f622" : "transparent",
                  color: form.category === cat ? "#3b82f6" : "#8b92a9",
                  transition: "all 0.15s",
                }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8b92a9", marginBottom: 8 }}>プロンプト本文 *</label>
            <textarea
              placeholder="例: あなたは競合分析の専門家です。ユーザーが入力した情報をもとに、強み・弱み・機会・脅威（SWOT）をわかりやすくまとめてください。"
              value={form.prompt}
              onChange={(e) => update("prompt", e.target.value)}
              rows={8}
              style={{ width: "100%", background: "#0d1120", border: "1px solid #1c2136", borderRadius: 10, padding: "12px 16px", color: "#e8eaf0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 12, color: "#4a5068", marginTop: 6 }}>購入者がコピーして使う or Latticeで実行できます</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8b92a9", marginBottom: 8 }}>価格</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[0, 300, 500, 1000, 2000].map((p) => (
                <button key={p} onClick={() => update("price", p)} style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${form.price === p ? "#3b82f6" : "#1c2136"}`,
                  background: form.price === p ? "#3b82f622" : "transparent",
                  color: form.price === p ? "#3b82f6" : "#8b92a9",
                  fontWeight: 700, transition: "all 0.15s",
                }}>
                  {p === 0 ? "無料" : `¥${p}`}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#4a5068", marginTop: 6 }}>有料の場合、収益の80%があなたに入ります</p>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", background: loading ? "#1c2136" : "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "15px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}
          >
            {loading ? "出品中..." : "出品する →"}
          </button>
        </div>
      </div>
    </main>
  );
}