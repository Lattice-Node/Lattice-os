"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  prompt: string | null;
}

const TEMPLATE_ID_MAP: Record<string, string> = {
  "daily-ai-news": "daily-ai-news",
  "competitor-monitor": "competitor-monitor",
  "weekly-report": "weekly-report",
  "sns-trend": "sns-trend",
  "price-alert": "price-alert",
  "inquiry-reply": "inquiry-reply",
  "contract-check": "contract-check",
};

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
  const router = useRouter();

  const filtered = templates.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "すべて" || t.category === category;
    return matchSearch && matchCat;
  });

  async function handleAdd(template: Template) {
    setAdding(true);
    const templateKey = TEMPLATE_ID_MAP[template.id] || template.id;
    router.push(`/agents/new?template=${templateKey}`);
  }

  // 詳細画面
  if (selected) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 100px" }}>
        <button
          onClick={() => setSelected(null)}
          style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "0 0 20px", display: "block" }}
        >
          ← 戻る
        </button>

        {/* アイコン＋タイトル */}
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

        {/* 説明 */}
        <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>説明</p>
          <p style={{ fontSize: 14, color: "#9096a8", lineHeight: 1.7, margin: 0 }}>
            {selected.description || "AIエージェントテンプレート"}
          </p>
        </div>

        {/* 詳細情報 */}
        <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #1f1f23" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>実行コスト</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>2クレジット / 実行</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
            <span style={{ fontSize: 13, color: "#6a7080" }}>カテゴリ</span>
            <span style={{ fontSize: 13, color: "#9096a8" }}>
              {selected.category ? `${selected.category}（${CATEGORY_DESC[selected.category] || ""}）` : "一般"}
            </span>
          </div>
        </div>

        {/* 追加ボタン */}
        <button
          onClick={() => handleAdd(selected)}
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
          {adding ? "追加中..." : "マイエージェントに追加する"}
        </button>
      </div>
    );
  }

  // 一覧画面
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
            onClick={() => setSelected(t)}
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
