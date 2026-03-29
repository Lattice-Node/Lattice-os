"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Variable {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  prompt: string | null;
  trigger: string | null;
  triggerCron: string | null;
  variables: string | null;
}

const CATEGORY_DESC: Record<string, string> = {
  "リサーチ": "情報収集・調査系",
  "営業": "営業・マーケティング系",
  "SNS": "SNS運用系",
  "生産性": "業務効率化系",
  "通知": "アラート・通知系",
  "法務": "契約・法務系",
};

const categories = ["すべて", "リサーチ", "営業", "SNS", "生産性", "通知"];

export default function StoreList({ templates }: { templates: Template[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("すべて");
  const [selected, setSelected] = useState<Template | null>(null);
  const [adding, setAdding] = useState(false);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const filtered = templates.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "すべて" || t.category === category;
    return matchSearch && matchCat;
  });

  function getVariables(template: Template): Variable[] {
    try {
      return JSON.parse(template.variables || "[]");
    } catch {
      return [];
    }
  }

  function buildPrompt(template: Template, values: Record<string, string>): string {
    let prompt = template.prompt || "";
    for (const [key, val] of Object.entries(values)) {
      prompt = prompt.replaceAll(`{{${key}}}`, val || "");
    }
    return prompt;
  }

  async function handleAdd() {
    if (!selected || adding) return;
    setAdding(true);
    setError("");

    const vars = getVariables(selected);
    const missing = vars.filter(v => !varValues[v.key]?.trim());
    if (missing.length > 0) {
      setError(`「${missing[0].label}」を入力してください`);
      setAdding(false);
      return;
    }

    const prompt = buildPrompt(selected, varValues);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selected.name,
          description: selected.description || "",
          prompt,
          trigger: selected.trigger || "manual",
          triggerCron: selected.triggerCron || "",
          connections: "[]",
          outputType: "app",
          outputConfig: "{}",
        }),
      });
      if (res.status === 403) {
        setError("フリープランではエージェントは3体までです。アップグレードしてください。");
        setAdding(false);
        return;
      }
      if (!res.ok) throw new Error("作成に失敗しました");
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => router.push(`/agents/${data.agent.id}`), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setAdding(false);
    }
  }

  function handleSelect(template: Template) {
    setSelected(template);
    setError("");
    setSuccess(false);
    setAdding(false);
    // Pre-fill with placeholders
    const vars = getVariables(template);
    const defaults: Record<string, string> = {};
    for (const v of vars) {
      defaults[v.key] = "";
    }
    setVarValues(defaults);
  }

  // Detail + setup view
  if (selected) {
    const vars = getVariables(selected);

    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button
          onClick={() => { setSelected(null); setSuccess(false); }}
          style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}
        >
          ← 戻る
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(108,113,232,0.12)", border: "1px solid rgba(108,113,232,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke="#6c71e8" strokeWidth="1.6">
              <rect x="2" y="3" width="14" height="12" rx="2" />
              <path d="M2 7h14M7 7v8" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              {selected.name}
            </h1>
            {selected.category && (
              <span style={{ fontSize: 11, color: "#6c71e8", background: "#1e2044", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
                {selected.category}
              </span>
            )}
          </div>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>説明</p>
          <p style={{ fontSize: 14, color: "#9096a8", lineHeight: 1.7, margin: 0 }}>
            {selected.description || "AIエージェントテンプレート"}
          </p>
        </div>

        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #242830" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>実行コスト</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>2クレジット / 実行</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: vars.length > 0 ? "1px solid #242830" : "none" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>カテゴリ</span>
            <span style={{ fontSize: 13, color: "#9096a8" }}>
              {selected.category ? `${selected.category}（${CATEGORY_DESC[selected.category] || ""}）` : "一般"}
            </span>
          </div>
          {selected.trigger === "schedule" && selected.triggerCron && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
              <span style={{ fontSize: 13, color: "#6a7080" }}>スケジュール</span>
              <span style={{ fontSize: 13, color: "#9096a8" }}>
                {(() => {
                  const parts = (selected.triggerCron || "").split(" ");
                  const h = parts[1] || "8";
                  const m = (parts[0] || "0").padStart(2, "0");
                  const dow = parts[4];
                  if (dow === "1") return `毎週月曜 ${h}:${m}`;
                  return `毎日 ${h}:${m}`;
                })()}
              </span>
            </div>
          )}
        </div>

        {/* Variable inputs */}
        {vars.length > 0 && (
          <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>設定項目</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {vars.map((v) => (
                <div key={v.key}>
                  <label style={{ fontSize: 13, color: "#9096a8", display: "block", marginBottom: 6 }}>{v.label}</label>
                  {v.type === "textarea" ? (
                    <textarea
                      value={varValues[v.key] || ""}
                      onChange={(e) => setVarValues({ ...varValues, [v.key]: e.target.value })}
                      placeholder={v.placeholder}
                      rows={3}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #2e3440", background: "#0e1117", color: "#e8eaf0", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                    />
                  ) : (
                    <input
                      value={varValues[v.key] || ""}
                      onChange={(e) => setVarValues({ ...varValues, [v.key]: e.target.value })}
                      placeholder={v.placeholder}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #2e3440", background: "#0e1117", color: "#e8eaf0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p style={{ fontSize: 13, color: "#f87171", margin: "0 0 12px" }}>{error}</p>
        )}

        {success ? (
          <div style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: "#0f2a1a", border: "1px solid #1a4a2a" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#4ade80", margin: 0 }}>エージェントを作成しました</p>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={adding}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              border: "none",
              background: adding ? "#1e2044" : "#6c71e8",
              color: adding ? "#4a5060" : "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: adding ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {adding ? "作成中..." : "マイエージェントに追加する"}
          </button>
        )}
      </div>
    );
  }

  // List view
  return (
    <>
      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9096a8" strokeWidth="1.8">
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5l4 4" />
        </svg>
        <input
          type="text"
          placeholder="エージェントを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={"pill " + (category === cat ? "active" : "inactive")}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <p className="section-label">{filtered.length}個のエージェント</p>
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 14px" }}>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>該当するエージェントが見つかりません</p>
        </div>
      ) : (
        filtered.map((t, i) => (
          <div
            key={t.id}
            className="store-card animate-in"
            style={{ animationDelay: i * 50 + "ms", cursor: "pointer" }}
            onClick={() => handleSelect(t)}
          >
            <div className="store-card-top">
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <p className="store-card-title">{t.name}</p>
                <p className="store-card-desc">{t.description || "AIエージェントテンプレート"}</p>
              </div>
              <div style={{ background: "rgba(108, 113, 232, 0.12)", padding: 7, borderRadius: 8, flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6c71e8" strokeWidth="1.6">
                  <rect x="2" y="3" width="14" height="12" rx="2" />
                  <path d="M2 7h14M7 7v8" />
                </svg>
              </div>
            </div>
            <div className="store-card-bottom">
              <div className="store-card-stats">
                <span className="store-card-stat" style={{ color: "var(--green)" }}>2クレジット / 回</span>
                {t.category && (
                  <span className="store-card-stat" style={{ color: "var(--muted)" }}>{t.category}</span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#4a5060" }}>詳細 ›</span>
            </div>
          </div>
        ))
      )}
    </>
  );
}
