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
  createdAt: string;
};

const CATEGORIES = ["すべて", "Research", "Writing", "Code", "Business", "Medical", "Legal", "Finance", "Custom"];

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filtered, setFiltered] = useState<Agent[]>([]);
  const [category, setCategory] = useState("すべて");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
    if (category !== "すべて") {
      result = result.filter((a) => a.category === category);
    }
    if (search) {
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [category, search, agents]);

  return (
    <main style={{ minHeight: "100vh", background: "#020817", color: "#e8e9ef", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>Marketplace</h1>
          <p style={{ color: "#6a7090", fontSize: 15 }}>AIミニアプリを探して、ボタン一つで使おう</p>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Agentを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", background: "#0f1017", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#e8e9ef", fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
        />

        {/* CATEGORIES */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "6px 16px",
                borderRadius: 100,
                fontSize: 13,
                border: `1px solid ${category === cat ? "#4d9fff" : "#1e2030"}`,
                background: category === cat ? "#4d9fff22" : "transparent",
                color: category === cat ? "#4d9fff" : "#6a7090",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* AGENTS */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#4a5068", padding: "80px 0" }}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <div style={{ color: "#4a5068", fontSize: 16, marginBottom: 12 }}>まだAgentがいません</div>
            <Link href="/publish" style={{ color: "#4d9fff", textDecoration: "none", fontSize: 14 }}>
              最初のAgentを公開する →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map((agent) => (
              <Link key={agent.id} href={`/apps/${agent.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#0f1017",
                  border: "1px solid #1e2030",
                  borderRadius: 16,
                  padding: "24px",
                  cursor: "pointer",
                  transition: "border-color 0.15s, transform 0.15s",
                  height: "100%",
                  boxSizing: "border-box",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#4d9fff44";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#1e2030";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, background: "#1a1e2e", border: "1px solid #2a3050", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
                    <span style={{ fontSize: 11, background: "#1a1e2e", color: "#6a7090", padding: "3px 8px", borderRadius: 100 }}>{agent.category}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "#e8e9ef", marginBottom: 8 }}>{agent.name}</h3>
                  <p style={{ color: "#6a7090", fontSize: 13, lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{agent.description}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #1e2030" }}>
                    <span style={{ fontSize: 12, color: "#4a5068" }}>by {agent.authorName}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "#4a5068" }}>{agent.useCount}回使用</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: agent.price === 0 ? "#4caf50" : "#4d9fff" }}>
                        {agent.price === 0 ? "無料" : `$${agent.price}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, background: "#4d9fff", borderRadius: 8, padding: "8px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    使ってみる →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
