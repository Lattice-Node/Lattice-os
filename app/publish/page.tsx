"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const CATEGORIES = ["Research", "Writing", "Code", "Business", "Medical", "Legal", "Finance", "Custom"];
const FIELD_TYPES = ["text", "textarea", "number", "select", "url", "email", "file"];

type Field = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  options: string; // selectの場合カンマ区切り
  required: boolean;
};

export default function PublishPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [agentType, setAgentType] = useState<"prompt" | "webhook">("prompt");
  const [fields, setFields] = useState<Field[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Research",
    prompt: "",
    webhookUrl: "",
    authorName: "",
    price: 0,
  });

  function update(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addField() {
    setFields((prev) => [...prev, {
      id: Math.random().toString(36).slice(2),
      label: "",
      type: "text",
      placeholder: "",
      options: "",
      required: true,
    }]);
  }

  function updateField(id: string, key: string, value: string | boolean) {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, [key]: value } : f));
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  async function submit() {
    if (!session) { signIn("github"); return; }
    if (!form.name || !form.description) {
      alert("名前と説明は必須です");
      return;
    }
    if (agentType === "prompt" && !form.prompt) {
      alert("プロンプトは必須です");
      return;
    }
    if (agentType === "webhook" && !form.webhookUrl) {
      alert("Webhook URLは必須です");
      return;
    }
    if (fields.length === 0) {
      alert("入力フィールドを最低1つ追加してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          agentType,
          fields: JSON.stringify(fields),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/apps/${data.agent.id}`);
      } else {
        alert("エラー: " + data.error);
      }
    } catch {
      alert("送信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020817", color: "#fff", fontFamily: "sans-serif" }}>
      {/* NAV */}
      <nav style={{ borderBottom: "1px solid #ffffff18", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#fff" }}>
          <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>L</div>
          <span style={{ fontWeight: 600, fontSize: 18 }}>Lattice OS</span>
        </Link>
        <Link href="/marketplace" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>← Marketplaceに戻る</Link>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Agentを公開する</h1>
        <p style={{ color: "#6b7280", marginBottom: 40, fontSize: 15 }}>あなたのAIをミニアプリとしてLatticeに登録しましょう</p>

        {!session && (
          <div style={{ background: "#1a1e2e", border: "1px solid #2a3050", borderRadius: 12, padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "#9ca3af" }}>公開するにはログインが必要です</span>
            <button onClick={() => signIn("github")} style={{ background: "#fff", color: "#000", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>GitHubでログイン</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* AGENT TYPE */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>Agentタイプ *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {([
                { value: "prompt", title: "Prompt Agent", desc: "プロンプトを書くだけ。初心者向け。", icon: "✍️" },
                { value: "webhook", title: "Webhook Agent", desc: "自分のサーバーと連携。制限なし。", icon: "⚡" },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setAgentType(t.value)}
                  style={{
                    background: agentType === t.value ? "#1a2a4a" : "#0f1117",
                    border: `1px solid ${agentType === t.value ? "#4d9fff" : "#1e2030"}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* NAME */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Agent名 *</label>
            <input
              type="text"
              placeholder="例: 競合分析AI"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              style={{ width: "100%", background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>説明 *</label>
            <textarea
              placeholder="例: 競合他社のウェブサイトを分析して、強みと弱みをレポートします"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              style={{ width: "100%", background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>カテゴリ *</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              style={{ width: "100%", background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none" }}
            >
              {CATEGORIES.map((cat) => <option key={cat} value={cat} style={{ background: "#020817" }}>{cat}</option>)}
            </select>
          </div>

          {/* PROMPT or WEBHOOK */}
          {agentType === "prompt" ? (
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>システムプロンプト *</label>
              <textarea
                placeholder="例: あなたは競合分析の専門家です。ユーザーが入力した会社名とURLを分析して、強み・弱み・機会・脅威をわかりやすくまとめてください。"
                value={form.prompt}
                onChange={(e) => update("prompt", e.target.value)}
                rows={6}
                style={{ width: "100%", background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "#4a5068", marginTop: 6 }}>入力フィールドの値は自動でプロンプトに追加されます</p>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>Webhook URL *</label>
              <input
                type="url"
                placeholder="https://your-server.com/api/agent"
                value={form.webhookUrl}
                onChange={(e) => update("webhookUrl", e.target.value)}
                style={{ width: "100%", background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "#4a5068", marginTop: 6 }}>LatticeがPOSTリクエストで入力データを送信します。レスポンスのtextフィールドを表示します。</p>
            </div>
          )}

          {/* INPUT FIELDS */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>入力フィールド定義 *</label>
                <p style={{ fontSize: 12, color: "#4a5068", marginTop: 4 }}>顧客がミニアプリで入力するフォームを定義してください</p>
              </div>
              <button
                onClick={addField}
                style={{ background: "#4d9fff", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                ＋ 追加
              </button>
            </div>

            {fields.length === 0 && (
              <div style={{ background: "#0f1117", border: "1px dashed #1e2030", borderRadius: 10, padding: "24px", textAlign: "center", color: "#4a5068", fontSize: 13 }}>
                「＋ 追加」でフィールドを追加してください
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {fields.map((field, i) => (
                <div key={field.id} style={{ background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4d9fff" }}>フィールド {i + 1}</span>
                    <button onClick={() => removeField(field.id)} style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: 12 }}>削除</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>ラベル名</label>
                      <input
                        type="text"
                        placeholder="例: 会社名"
                        value={field.label}
                        onChange={(e) => updateField(field.id, "label", e.target.value)}
                        style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>タイプ</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, "type", e.target.value)}
                        style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none" }}
                      >
                        {FIELD_TYPES.map((t) => <option key={t} value={t} style={{ background: "#020817" }}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>プレースホルダー</label>
                    <input
                      type="text"
                      placeholder="例: 株式会社〇〇"
                      value={field.placeholder}
                      onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                      style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  {field.type === "select" && (
                    <div style={{ marginTop: 10 }}>
                      <label style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>選択肢（カンマ区切り）</label>
                      <input
                        type="text"
                        placeholder="例: 飲食,IT,小売,製造"
                        value={field.options}
                        onChange={(e) => updateField(field.id, "options", e.target.value)}
                        style={{ width: "100%", background: "#151722", border: "1px solid #1e2030", borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AUTHOR */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>作者名</label>
            <input
              type="text"
              placeholder="例: yamada_taro"
              value={form.authorName}
              onChange={(e) => update("authorName", e.target.value)}
              style={{ width: "100%", background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* PRICE */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#9ca3af" }}>価格（1回あたり $）</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "#0f1117", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 12, color: "#4a5068", marginTop: 6 }}>0にすると無料で公開されます</p>
          </div>

          {/* SUBMIT */}
          <button
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", background: loading ? "#1e2030" : "#4d9fff", color: "#fff", border: "none", borderRadius: 10, padding: "16px", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s" }}
          >
            {loading ? "公開中..." : "ミニアプリとして公開する"}
          </button>
        </div>
      </div>
    </main>
  );
}


