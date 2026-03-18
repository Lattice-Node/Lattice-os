"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgent(data.agent);
        setLoading(false);
      });

    // すでにインストール済みか確認
    const existing = JSON.parse(localStorage.getItem("installedAgents") || "[]");
    setInstalled(existing.some((a: Agent) => a.id === id));
  }, [id]);

  function install() {
    if (!agent) return;
    const existing = JSON.parse(localStorage.getItem("installedAgents") || "[]");
    const already = existing.find((a: Agent) => a.id === agent.id);
    if (!already) {
      localStorage.setItem("installedAgents", JSON.stringify([...existing, agent]));
    }
    setInstalled(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
        <div className="text-gray-400">Agentが見つかりません</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">L</div>
          <span className="font-semibold text-lg">Lattice OS</span>
        </Link>
        <Link href="/marketplace" className="text-sm text-gray-400 hover:text-white transition">
          ← Marketplaceに戻る
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            🤖
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                {agent.category}
              </span>
            </div>
            <p className="text-gray-400 mb-3">{agent.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>by {agent.authorName}</span>
              <span>{agent.useCount} 回使用</span>
              <span>{new Date(agent.createdAt).toLocaleDateString("ja-JP")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {agent.price === 0 ? "無料" : `$${agent.price} / 回`}
              </div>
              <div className="text-sm text-gray-400">
                {agent.price === 0 ? "今すぐ無料で使えます" : "使用するたびに課金されます"}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button
                onClick={install}
                disabled={installed}
                className={`px-8 py-3 rounded-xl font-medium transition text-lg ${
                  installed
                    ? "bg-green-600 cursor-default"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {installed ? "✓ インストール済み" : "インストール"}
              </button>
              {installed && (
                <Link href="/workspace" className="text-sm text-blue-400 hover:text-blue-300 transition">
                  Workspaceで使う →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">このAgentのプロンプト</h2>
          <div className="bg-black/30 rounded-xl p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {agent.prompt}
          </div>
        </div>
      </div>
    </main>
  );
}
