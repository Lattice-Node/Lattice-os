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
};

const categories = ["すべて", "リサーチ", "営業", "SNS", "生産性", "通知"];

export default function StoreList({ templates }: { templates: Template[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("すべて");
  const router = useRouter();

  const filtered = templates.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "すべて" || t.category === category;
    return matchSearch && matchCat;
  });

  function handleUse(template: Template) {
    const templateKey = TEMPLATE_ID_MAP[template.id] || template.id;
    router.push(`/agents/new?template=${templateKey}`);
  }

  return (
    <>
      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9096a8" strokeWidth="1.8">
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5l4 4" />
        </svg>
        <input type="text" placeholder="エージェントを検索..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="pills">
        {categories.map((cat) => (
          <button key={cat} className={"pill " + (category === cat ? "active" : "inactive")} onClick={() => setCategory(cat)}>
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
          <div key={t.id} className="store-card animate-in" style={{ animationDelay: i * 50 + "ms" }}>
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
                <span className="store-card-stat" style={{ color: "var(--green)" }}>2 cr/回</span>
                {t.category && <span className="store-card-stat" style={{ color: "var(--muted)" }}>{t.category}</span>}
              </div>
              <button className="btn-add" onClick={() => handleUse(t)}>
                使う
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}