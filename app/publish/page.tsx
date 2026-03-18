"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = ["Research", "Writing", "Code", "Business", "Medical", "Legal", "Custom"];

export default function PublishPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Research",
    prompt: "",
    authorName: "",
    price: 0,
  });

  function update(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    if (!form.name || !form.description || !form.prompt) {
      alert("名前・説明・プロンプトは必須です");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/marketplace/${data.agent.id}`);
      } else {
        alert("エラーが発生しました: " + data.error);
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      {/* NAV */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">L</div>
          <span className="font-semibold text-lg">Lattice OS</span>
        </Link>
        <Link href="/marketplace" className="text-sm text-gray-400 hover:text-white transition">
          ← Marketplaceに戻る
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Agentを公開する</h1>
        <p className="text-gray-400 mb-10">あなたのAIエージェントをLattice OSに登録して、世界中で使ってもらいましょう。</p>

        <div className="flex flex-col gap-6">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-2">Agent名 *</label>
            <input
              type="text"
              placeholder="例: Web Researcher Pro"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-2">説明 *</label>
            <textarea
              placeholder="例: Webから情報を収集して、わかりやすくまとめるAgentです。"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-2">カテゴリ *</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#020817]">{cat}</option>
              ))}
            </select>
          </div>

          {/* PROMPT */}
          <div>
            <label className="block text-sm font-medium mb-2">システムプロンプト *</label>
            <textarea
              placeholder="例: あなたはWebリサーチの専門家です。ユーザーの依頼に対して、正確で詳細な情報を収集し、わかりやすくまとめてください。"
              value={form.prompt}
              onChange={(e) => update("prompt", e.target.value)}
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition resize-none font-mono"
            />
          </div>

          {/* AUTHOR */}
          <div>
            <label className="block text-sm font-medium mb-2">作者名</label>
            <input
              type="text"
              placeholder="例: yamada_taro"
              value={form.authorName}
              onChange={(e) => update("authorName", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="block text-sm font-medium mb-2">価格（1回あたり $）</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">0にすると無料で公開されます</p>
          </div>

          {/* SUBMIT */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-medium text-lg transition mt-2"
          >
            {loading ? "公開中..." : "Agentを公開する"}
          </button>
        </div>
      </div>
    </main>
  );
}