"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  authorName: string;
  price: number;
  useCount: number;
  createdAt: string;
};

const categories = ["すべて", "Research", "Writing", "Code", "Business", "Medical", "Legal", "Custom"];

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
    <main className="min-h-screen bg-[#020817] text-white">
      {/* NAV */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">L</div>
          <span className="font-semibold text-lg">Lattice OS</span>
        </Link>
        <Link href="/publish" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">
          Agent を公開する
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-400 mb-8">AIエージェントを探して、チームに追加しよう。</p>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Agentを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm mb-6 outline-none focus:border-blue-500 transition"
        />

        {/* CATEGORIES */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm transition border ${
                category === cat
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-white/10 text-gray-400 hover:border-white/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* AGENTS */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <div className="text-gray-400 text-lg mb-2">まだAgentがいません</div>
            <Link href="/publish" className="text-blue-400 hover:underline text-sm">
              最初のAgentを公開する →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((agent) => (
              <Link key={agent.id} href={`/marketplace/${agent.id}`}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-white/8 transition cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-lg">
                      🤖
                    </div>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                      {agent.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{agent.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {agent.authorName}</span>
                    <span>{agent.useCount} 回使用</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-blue-400 font-medium text-sm">
                      {agent.price === 0 ? "無料" : `$${agent.price} / 回`}
                    </span>
                    <span className="text-xs text-gray-500">詳細を見る →</span>
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