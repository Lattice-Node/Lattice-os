"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  authorName: string;
  price: number;
  useCount: number;
  prompt: string;
};

const CATEGORIES = ["すべて", "Writing", "Business", "Code", "Research", "Finance", "Legal", "Medical", "Custom"];

const CATEGORY_ICONS: Record<string, string> = {
  Research: "🔍", Writing: "✍️", Code: "💻", Business: "📊",
  Medical: "🏥", Legal: "⚖️", Finance: "💰", Custom: "⚡", default: "🧩",
};
const CATEGORY_COLORS: Record<string, string> = {
  Research: "#4FC3F7", Writing: "#81C784", Code: "#FF8A65", Business: "#CE93D8",
  Medical: "#F06292", Legal: "#FFD54F", Finance: "#4DB6AC", Custom: "#FF8A65", default: "#90A4AE",
};

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filtered, setFiltered] = useState<Agent[]>([]);
  const [category, setCategory] = useState("すべて");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents || []);
        setFiltered(data.agents || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = agents;
    if (category !== "すべて") result = result.filter((a) => a.category === category);
    if (search) result = result.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [category, search, agents]);

  const handleCopy = (e: React.MouseEvent, agent: Agent) => {
    e.preventDefault();
    e.stopPropagation();
    if (agent.price > 0) return;
    navigator.clipboard.writeText(agent.prompt || agent.description);
    setCopied(agent.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <style>{`
        .agent-card { transition: border-color 0.15s, transform 0.15s; display: block; text-decoration: none; color: inherit; }
        .agent-card:hover { transform: translateY(-2px); border-color: #3b82f655 !important; }
        .copy-btn:hover { background: #ffffff18 !important; }
      `}</style>
      <Nav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>プロンプト一覧</h1>
          <p style={{ color: "#8b92a9", fontSize: 14 }}>コピーしてすぐ使える・Latticeでそのまま実行できる</p>
        </div>

        <input
          type="text"
          placeholder="プロンプトを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", background: "#0d1120", border: "1px solid #1c2136", borderRadius: 10, padding: "12px 16px", color: "#e8eaf0", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: "6px 14px", borderRadius: 100, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
              border: `1px solid ${category === cat ? "#3b82f6" : "#1c2136"}`,
              background: category === cat ? "#3b82f622" : "transparent",
              color: category === cat ? "#3b82f6" : "#8b92a9",
            }}>
              {cat === "すべて" ? cat : `${CATEGORY_ICONS[cat] ?? "🧩"} ${cat}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#4a5068", padding: "80px 0" }}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧩</div>
            <div style={{ color: "#4a5068", marginBottom: 12 }}>プロンプトが見つかりません</div>
            <Link href="/publish" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>最初のプロンプトを公開する →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {filtered.map((agent) => {
              const color = CATEGORY_COLORS[agent.category] ?? CATEGORY_COLORS.default;
              const icon = CATEGORY_ICONS[agent.category] ?? "🧩";
              const isCopied = copied === agent.id;
              return (
                <Link key={agent.id} href={`/apps/${agent.id}`} className="agent-card" style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 14, padding: "20px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, background: color + "18", border: `1px solid ${color}30`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: color, fontWeight: 700 }}>{agent.category}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{agent.name}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: agent.price === 0 ? "#34d399" : "#3b82f6", flexShrink: 0 }}>
                      {agent.price === 0 ? "無料" : `¥${agent.price}`}
                    </div>
                  </div>

                  <p style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.65, marginBottom: 16, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {agent.description}
                  </p>

                  <div style={{ fontSize: 11, color: "#4a5068", marginBottom: 12 }}>
                    by {agent.authorName} · {agent.useCount}回使用
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      className="copy-btn"
                      onClick={(e) => handleCopy(e, agent)}
                      disabled={agent.price > 0}
                      style={{
                        background: isCopied ? "#34d39922" : "#ffffff0a",
                        border: `1px solid ${isCopied ? "#34d399" : "#1c2136"}`,
                        color: isCopied ? "#34d399" : agent.price > 0 ? "#4a5068" : "#e8eaf0",
                        borderRadius: 8, padding: "9px",
                        fontSize: 12, fontWeight: 700, cursor: agent.price > 0 ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {isCopied ? "✓ コピー済み" : agent.price > 0 ? "🔒 有料" : "📋 コピー"}
                    </button>
                    <div style={{
                      background: "#2563eb", color: "#fff", borderRadius: 8, padding: "9px",
                      fontSize: 12, fontWeight: 700, textAlign: "center",
                    }}>
                      ▶ 実行する
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}