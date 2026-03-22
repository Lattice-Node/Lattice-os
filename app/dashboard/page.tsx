"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Nav from "@/components/Nav";

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  useCount: number;
  createdAt: string;
  stripeAccountId: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { setLoading(false); return; }
    if (status !== "authenticated") return;
    fetch("/api/agents?mine=1")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents ?? []);
        setLoading(false);
      });
  }, [status]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "1") {
      alert("Stripeアカウントの連携が完了しました！");
    }
  }, []);

  const totalUseCount = agents.reduce((sum, a) => sum + a.useCount, 0);
  const totalRevenue = agents.reduce((sum, a) => sum + a.price * a.useCount * 0.8, 0);

  const handleDelete = async (id: string) => {
    if (!confirm("このプロンプトを削除しますか？")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const handleConnect = async (agentId: string) => {
    setConnectingId(agentId);
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("エラー: " + data.error);
    } catch {
      alert("Stripe連携に失敗しました");
    } finally {
      setConnectingId(null);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
        <span style={{ fontSize: 40, color: "#1c2136" }}>◈</span>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#4a5068" }}>ログインが必要です</p>
        <button onClick={() => signIn("github")} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          GitHubでログイン
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#e8eaf0", fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>ダッシュボード</h1>
            <p style={{ fontSize: 13, color: "#8b92a9" }}>{session?.user?.name} のプロンプト管理</p>
          </div>
          <Link href="/publish" style={{ background: "#2563eb", color: "#fff", textDecoration: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            ＋ 新しいプロンプトを出品
          </Link>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 40 }}>
          {[
            { label: "出品中のプロンプト", value: agents.length, unit: "個" },
            { label: "累計使用回数", value: totalUseCount, unit: "回" },
            { label: "累計収益（80%）", value: `¥${totalRevenue.toFixed(0)}`, unit: "" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#3b82f6", letterSpacing: "-0.02em" }}>
                {s.value}<span style={{ fontSize: 14, fontWeight: 400, color: "#8b92a9", marginLeft: 4 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: "#4a5068", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4a5068", marginBottom: 14 }}>
          出品中のプロンプト
        </div>

        {loading ? (
          <div style={{ color: "#4a5068", fontSize: 14 }}>読み込み中...</div>
        ) : agents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#4a5068", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <p>まだプロンプトを出品していません</p>
            <Link href="/publish" style={{ background: "#2563eb", color: "#fff", textDecoration: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              最初のプロンプトを出品する
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {agents.map((agent) => (
              <div key={agent.id} style={{ background: "#0d1120", border: "1px solid #1c2136", borderRadius: 12, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", fontWeight: 700, marginBottom: 4 }}>{agent.category}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{agent.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{agent.description}</div>
                  </div>
                  <div style={{ marginLeft: 16, flexShrink: 0 }}>
                    {agent.price === 0 ? (
                      <span style={{ background: "#1a2e1a", color: "#34d399", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>無料</span>
                    ) : (
                      <span style={{ background: "#1a1e2e", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>¥{agent.price}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 24, padding: "12px 0", borderTop: "1px solid #1c2136", borderBottom: "1px solid #1c2136", marginBottom: 14 }}>
                  {[
                    { label: "使用回数", value: `${agent.useCount}回` },
                    { label: "収益", value: `¥${(agent.price * agent.useCount * 0.8).toFixed(0)}` },
                    { label: "公開日", value: new Date(agent.createdAt).toLocaleDateString("ja-JP") },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#c8cad8" }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#4a5068" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href={`/apps/${agent.id}`} style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none", border: "1px solid #1c2a45", padding: "6px 14px", borderRadius: 6 }}>
                    詳細を見る
                  </Link>
                  {agent.price > 0 && (
                    <button
                      onClick={() => handleConnect(agent.id)}
                      disabled={connectingId === agent.id}
                      style={{
                        fontSize: 13,
                        color: agent.stripeAccountId ? "#34d399" : "#f59e0b",
                        background: "none",
                        border: `1px solid ${agent.stripeAccountId ? "#1a2e1a" : "#3a2a0a"}`,
                        padding: "6px 14px",
                        borderRadius: 6,
                        cursor: connectingId === agent.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {connectingId === agent.id ? "処理中..." : agent.stripeAccountId ? "✓ Stripe連携済み" : "💳 Stripe口座を連携"}
                    </button>
                  )}
                  <button onClick={() => handleDelete(agent.id)} style={{ fontSize: 13, color: "#f87171", background: "none", border: "1px solid #3a1a1a", padding: "6px 14px", borderRadius: 6, cursor: "pointer" }}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}