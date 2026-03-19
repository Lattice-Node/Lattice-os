"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  useCount: number;
  createdAt: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalUseCount = agents.reduce((sum, a) => sum + a.useCount, 0);
  const totalRevenue = agents.reduce((sum, a) => sum + a.price * a.useCount * 0.8, 0);

  const handleDelete = async (id: string) => {
    if (!confirm("このAgentを削除しますか？")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  if (status === "unauthenticated") {
    return (
      <div className="root">
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p className="empty-title">ログインが必要です</p>
          <button className="btn-primary" onClick={() => signIn("github")}>
            GitHubでログイン
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="root">
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">Lattice OS</span>
        </Link>
        <div className="nav-links">
          <Link href="/marketplace" className="nav-link">Marketplace</Link>
          <Link href="/workspace" className="nav-link">Workspace</Link>
          <Link href="/publish" className="nav-link">Agentを公開</Link>
          {session?.user?.image && (
            <img src={session.user.image} className="avatar" alt="avatar" />
          )}
        </div>
      </nav>

      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">開発者ダッシュボード</h1>
            <p className="page-sub">{session?.user?.name} のAgent管理</p>
          </div>
          <Link href="/publish" className="btn-primary">＋ 新しいAgentを公開</Link>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          {[
            { label: "公開Agent数", value: agents.length, unit: "個" },
            { label: "累計実行回数", value: totalUseCount, unit: "回" },
            { label: "累計収益（80%）", value: `$${totalRevenue.toFixed(2)}`, unit: "" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-value">{s.value}<span className="stat-unit">{s.unit}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* AGENT LIST */}
        <div className="section-title">公開中のAgent</div>

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : agents.length === 0 ? (
          <div className="empty-agents">
            <p>まだAgentを公開していません</p>
            <Link href="/publish" className="btn-primary">最初のAgentを公開する</Link>
          </div>
        ) : (
          <div className="agent-grid">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-card">
                <div className="agent-card-top">
                  <div className="agent-card-info">
                    <span className="agent-category">{agent.category}</span>
                    <h3 className="agent-name">{agent.name}</h3>
                    <p className="agent-desc">{agent.description}</p>
                  </div>
                  <div className="agent-card-price">
                    {agent.price === 0 ? (
                      <span className="price-free">Free</span>
                    ) : (
                      <span className="price-paid">${agent.price}/回</span>
                    )}
                  </div>
                </div>

                <div className="agent-card-stats">
                  <div className="agent-stat">
                    <span className="agent-stat-value">{agent.useCount}</span>
                    <span className="agent-stat-label">実行回数</span>
                  </div>
                  <div className="agent-stat">
                    <span className="agent-stat-value">${(agent.price * agent.useCount * 0.8).toFixed(2)}</span>
                    <span className="agent-stat-label">収益</span>
                  </div>
                  <div className="agent-stat">
                    <span className="agent-stat-value">{new Date(agent.createdAt).toLocaleDateString("ja-JP")}</span>
                    <span className="agent-stat-label">公開日</span>
                  </div>
                </div>

                <div className="agent-card-actions">
                  <Link href={`/marketplace/${agent.id}`} className="btn-view">詳細を見る</Link>
                  <button className="btn-delete" onClick={() => handleDelete(agent.id)}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .root { min-height: 100vh; background: #0a0b0f; color: #e8e9ef; font-family: "DM Sans", "Hiragino Sans", sans-serif; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 1px solid #1e2030; }
  .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #e8e9ef; }
  .logo-icon { font-size: 18px; color: #4d9fff; }
  .logo-text { font-size: 16px; font-weight: 700; }
  .nav-links { display: flex; align-items: center; gap: 24px; }
  .nav-link { font-size: 13px; color: #6a7090; text-decoration: none; transition: color 0.15s; }
  .nav-link:hover { color: #e8e9ef; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; }
  .main { max-width: 1000px; margin: 0 auto; padding: 40px 32px; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
  .page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 4px; }
  .page-sub { font-size: 14px; color: #6a7090; }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
  .stat-card { background: #0f1017; border: 1px solid #1e2030; border-radius: 12px; padding: 20px 24px; }
  .stat-value { font-size: 32px; font-weight: 800; color: #4d9fff; letter-spacing: -0.02em; }
  .stat-unit { font-size: 16px; font-weight: 400; margin-left: 4px; color: #6a7090; }
  .stat-label { font-size: 12px; color: #4a5068; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #4a5068; margin-bottom: 16px; }
  .loading { color: #4a5068; font-size: 14px; }
  .empty-agents { text-align: center; padding: 48px; color: #4a5068; display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .agent-grid { display: flex; flex-direction: column; gap: 12px; }
  .agent-card { background: #0f1017; border: 1px solid #1e2030; border-radius: 12px; padding: 20px; }
  .agent-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .agent-category { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #4d9fff; font-weight: 700; }
  .agent-name { font-size: 16px; font-weight: 700; margin: 4px 0; }
  .agent-desc { font-size: 13px; color: #6a7090; line-height: 1.5; }
  .price-free { background: #1a2e1a; color: #4caf50; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 100px; }
  .price-paid { background: #1a1e2e; color: #4d9fff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 100px; }
  .agent-card-stats { display: flex; gap: 24px; padding: 14px 0; border-top: 1px solid #1e2030; border-bottom: 1px solid #1e2030; margin-bottom: 14px; }
  .agent-stat { display: flex; flex-direction: column; gap: 2px; }
  .agent-stat-value { font-size: 16px; font-weight: 700; color: #c8cad8; }
  .agent-stat-label { font-size: 11px; color: #4a5068; }
  .agent-card-actions { display: flex; gap: 8px; }
  .btn-view { font-size: 13px; color: #4d9fff; text-decoration: none; border: 1px solid #1e2a45; padding: 6px 14px; border-radius: 6px; transition: background 0.15s; }
  .btn-view:hover { background: #1a1e2e; }
  .btn-delete { font-size: 13px; color: #ff6b6b; background: none; border: 1px solid #3a1a1a; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
  .btn-delete:hover { background: #ff6b6b18; }
  .btn-primary { display: inline-block; background: #4d9fff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; transition: background 0.15s; border: none; cursor: pointer; }
  .btn-primary:hover { background: #3d8fee; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 16px; text-align: center; }
  .empty-icon { font-size: 48px; color: #1e2030; }
  .empty-title { font-size: 20px; font-weight: 700; color: #4a5068; }
`;
