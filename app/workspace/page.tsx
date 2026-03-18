"use client";

import { Suspense } from "react";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  executeAgent,
  getInstalledAgents,
  removeInstalledAgent,
  type InstalledAgent,
} from "@/lib/executor";

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="md-code">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="md-ul">$&</ul>')
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/^(?!<[h|u|p])(.+)$/gm, '<p class="md-p">$1</p>');
}

const CATEGORY_COLORS: Record<string, string> = {
  research: "#4FC3F7",
  writing: "#81C784",
  coding: "#FF8A65",
  analysis: "#CE93D8",
  marketing: "#F06292",
  productivity: "#FFD54F",
  other: "#90A4AE",
};

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? CATEGORY_COLORS.other;
}

function WorkspaceInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<InstalledAgent[]>([]);
  const [selected, setSelected] = useState<InstalledAgent | null>(null);
  const [task, setTask] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const installed = getInstalledAgents();
    setAgents(installed);
    if (installed.length > 0) {
      // success=1のときはagentIdで選択
      const agentId = searchParams.get("agentId");
      const target = agentId ? installed.find((a) => a.id === agentId) : null;
      setSelected(target ?? installed[0]);
    }

    if (searchParams.get("success") === "1") {
      setStatus("✅ 決済完了！Agentを実行できます。");
    }
    if (searchParams.get("canceled") === "1") {
      setStatus("❌ 決済がキャンセルされました。");
    }
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCheckout = async () => {
    if (!selected || !session) return;
    setCheckoutLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: selected.id,
        agentName: selected.name,
        price: selected.price,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setStatus("❌ 決済エラー: " + data.error);
      setCheckoutLoading(false);
    }
  };

  const handleRun = async () => {
    if (!selected || !task.trim() || running) return;

    // 未ログインなら認証へ
    if (!session) {
      signIn("github");
      return;
    }

    // 有料Agentは決済へ
    if (selected.price > 0) {
      await handleCheckout();
      return;
    }

    setRunning(true);
    setDone(false);
    setOutput("");
    setStatus(null);

    await executeAgent({
      agent: selected,
      task,
      onStatus: (msg) => setStatus(msg),
      onToken: (tok) => setOutput((prev) => prev + tok),
      onDone: () => {
        setStatus(null);
        setRunning(false);
        setDone(true);
      },
      onError: (msg) => {
        setStatus(`❌ エラー: ${msg}`);
        setRunning(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRun();
  };

  const handleRemove = (id: string) => {
    removeInstalledAgent(id);
    const updated = agents.filter((a) => a.id !== id);
    setAgents(updated);
    if (selected?.id === id) setSelected(updated[0] ?? null);
  };

  const handleCopy = () => navigator.clipboard.writeText(output).catch(() => {});

  const handleClear = () => {
    setOutput("");
    setStatus(null);
    setDone(false);
    setTask("");
    textareaRef.current?.focus();
  };

  const runButtonLabel = () => {
    if (running) return <><span className="spinner" /> 実行中...</>;
    if (!session) return "🔑 ログインして実行";
    if (selected && selected.price > 0) return checkoutLoading ? "決済画面へ..." : `💳 $${selected.price} で実行`;
    return "▶ 実行";
  };

  return (
    <div className="workspace-root">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="logo-link">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Lattice</span>
          </Link>
          <span className="sidebar-label">Workspace</span>
        </div>

        <div className="sidebar-section-title">インストール済み Agent</div>

        {agents.length === 0 ? (
          <div className="sidebar-empty">
            <p>Agentがありません</p>
            <Link href="/marketplace" className="sidebar-cta">Marketplaceへ →</Link>
          </div>
        ) : (
          <ul className="agent-list">
            {agents.map((agent) => (
              <li
                key={agent.id}
                className={`agent-item ${selected?.id === agent.id ? "active" : ""}`}
                onClick={() => {
                  setSelected(agent);
                  setOutput("");
                  setStatus(null);
                  setDone(false);
                }}
              >
                <div className="agent-item-top">
                  <span className="agent-dot" style={{ background: categoryColor(agent.category) }} />
                  <span className="agent-item-name">{agent.name}</span>
                  <button
                    className="agent-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemove(agent.id); }}
                    title="削除"
                  >✕</button>
                </div>
                <div className="agent-item-desc">{agent.description}</div>
              </li>
            ))}
          </ul>
        )}

        <div className="sidebar-footer">
          {session ? (
            <span className="sidebar-user">👤 {session.user?.name}</span>
          ) : (
            <button className="sidebar-login" onClick={() => signIn("github")}>
              GitHubでログイン
            </button>
          )}
          <Link href="/marketplace" className="sidebar-link">＋ Agentを追加</Link>
          <Link href="/publish" className="sidebar-link">↑ Agentを公開</Link>
        </div>
      </aside>

      <main className="main-panel">
        {!selected ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-title">Agentを選択してください</p>
            <p className="empty-sub">左サイドバーからAgentを選ぶか、Marketplaceから追加してください。</p>
            <Link href="/marketplace" className="btn-primary">Marketplaceへ</Link>
          </div>
        ) : (
          <>
            <div className="agent-header">
              <div className="agent-header-left">
                <span
                  className="agent-badge"
                  style={{
                    background: categoryColor(selected.category) + "22",
                    color: categoryColor(selected.category),
                    borderColor: categoryColor(selected.category) + "44"
                  }}
                >{selected.category}</span>
                <h1 className="agent-title">{selected.name}</h1>
                <span className="agent-author">by {selected.authorName}</span>
              </div>
              <div className="agent-header-right">
                {selected.price === 0 ? (
                  <span className="price-tag free">Free</span>
                ) : (
                  <span className="price-tag paid">${selected.price} / 回</span>
                )}
              </div>
            </div>

            <p className="agent-desc-main">{selected.description}</p>

            {selected.price > 0 && (
              <div className="paid-notice">
                💳 このAgentは有料です。実行ボタンを押すとStripe決済画面に移動します。
              </div>
            )}

            <div className="task-section">
              <label className="task-label">
                タスクを入力
                <span className="task-hint">Cmd+Enter で実行</span>
              </label>
              <textarea
                ref={textareaRef}
                className="task-textarea"
                rows={4}
                placeholder={`${selected.name} に何をしてほしいですか？`}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={running}
              />
              <div className="task-actions">
                <button
                  className="btn-run"
                  onClick={handleRun}
                  disabled={running || !task.trim() || checkoutLoading}
                >
                  {runButtonLabel()}
                </button>
                {(output || status) && !running && (
                  <button className="btn-clear" onClick={handleClear}>クリア</button>
                )}
              </div>
            </div>

            {(status || output) && (
              <div className="output-section">
                <div className="output-header">
                  <span className="output-title">
                    {running ? "⚡ 出力中..." : done ? "✅ 完了" : "出力"}
                  </span>
                  {output && (
                    <button className="btn-copy" onClick={handleCopy}>コピー</button>
                  )}
                </div>
                {status && <div className="status-bar">{status}</div>}
                {output && (
                  <div
                    ref={outputRef}
                    className="output-body"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .workspace-root { display: flex; height: 100vh; font-family: "DM Sans", "Hiragino Sans", "Noto Sans JP", sans-serif; background: #0a0b0f; color: #e8e9ef; overflow: hidden; }
        .sidebar { width: 280px; min-width: 280px; background: #0f1017; border-right: 1px solid #1e2030; display: flex; flex-direction: column; overflow: hidden; }
        .sidebar-header { padding: 20px 20px 16px; border-bottom: 1px solid #1e2030; display: flex; align-items: center; gap: 12px; }
        .logo-link { display: flex; align-items: center; gap: 6px; text-decoration: none; color: #e8e9ef; }
        .logo-icon { font-size: 18px; color: #4d9fff; }
        .logo-text { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; }
        .sidebar-label { font-size: 11px; color: #4a5068; text-transform: uppercase; letter-spacing: 0.08em; margin-left: auto; }
        .sidebar-section-title { padding: 14px 20px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #4a5068; font-weight: 600; }
        .sidebar-empty { padding: 24px 20px; text-align: center; color: #4a5068; font-size: 13px; flex: 1; }
        .sidebar-cta { display: inline-block; margin-top: 10px; color: #4d9fff; text-decoration: none; font-size: 13px; }
        .agent-list { list-style: none; flex: 1; overflow-y: auto; padding: 4px 10px; }
        .agent-list::-webkit-scrollbar { width: 4px; }
        .agent-list::-webkit-scrollbar-thumb { background: #1e2030; border-radius: 4px; }
        .agent-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 3px; transition: background 0.15s; border: 1px solid transparent; }
        .agent-item:hover { background: #151722; }
        .agent-item.active { background: #151722; border-color: #1e2a45; }
        .agent-item-top { display: flex; align-items: center; gap: 7px; margin-bottom: 4px; }
        .agent-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .agent-item-name { font-size: 13px; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #c8cad8; }
        .agent-remove { background: none; border: none; color: #3a3d52; cursor: pointer; font-size: 10px; padding: 2px 4px; border-radius: 3px; transition: color 0.15s, background 0.15s; }
        .agent-remove:hover { color: #ff6b6b; background: #ff6b6b18; }
        .agent-item-desc { font-size: 11px; color: #4a5068; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-footer { padding: 14px 20px; border-top: 1px solid #1e2030; display: flex; flex-direction: column; gap: 6px; }
        .sidebar-user { font-size: 12px; color: #6a7090; }
        .sidebar-login { background: none; border: 1px solid #1e2030; color: #4d9fff; border-radius: 6px; font-size: 12px; padding: 6px 10px; cursor: pointer; transition: border-color 0.15s; text-align: left; }
        .sidebar-login:hover { border-color: #4d9fff; }
        .sidebar-link { font-size: 12px; color: #4d9fff; text-decoration: none; opacity: 0.8; transition: opacity 0.15s; }
        .sidebar-link:hover { opacity: 1; }
        .main-panel { flex: 1; overflow-y: auto; padding: 36px 44px; max-width: 860px; }
        .main-panel::-webkit-scrollbar { width: 5px; }
        .main-panel::-webkit-scrollbar-thumb { background: #1e2030; border-radius: 4px; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 12px; }
        .empty-icon { font-size: 48px; color: #1e2030; margin-bottom: 8px; }
        .empty-title { font-size: 20px; font-weight: 700; color: #4a5068; }
        .empty-sub { font-size: 14px; color: #3a3d52; max-width: 320px; line-height: 1.6; }
        .agent-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
        .agent-header-left { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
        .agent-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 100px; border: 1px solid; }
        .agent-title { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: #e8e9ef; }
        .agent-author { font-size: 13px; color: #4a5068; margin-top: 2px; }
        .price-tag { font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
        .price-tag.free { background: #1a2e1a; color: #4caf50; }
        .price-tag.paid { background: #1a1e2e; color: #4d9fff; }
        .agent-desc-main { font-size: 14px; color: #6a7090; line-height: 1.7; margin-bottom: 20px; margin-top: 4px; }
        .paid-notice { background: #1a1e2e; border: 1px solid #2a3050; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #7a8aaa; margin-bottom: 20px; }
        .task-section { margin-bottom: 28px; }
        .task-label { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #4a5068; margin-bottom: 8px; }
        .task-hint { font-size: 11px; color: #2e3248; font-weight: 400; text-transform: none; letter-spacing: 0; }
        .task-textarea { width: 100%; background: #0f1017; border: 1px solid #1e2030; border-radius: 10px; color: #e8e9ef; font-family: inherit; font-size: 14px; line-height: 1.7; padding: 14px 16px; resize: vertical; outline: none; transition: border-color 0.2s; }
        .task-textarea:focus { border-color: #4d9fff44; }
        .task-textarea::placeholder { color: #2e3248; }
        .task-textarea:disabled { opacity: 0.5; cursor: not-allowed; }
        .task-actions { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
        .btn-run { display: flex; align-items: center; gap: 7px; background: #4d9fff; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; padding: 10px 22px; cursor: pointer; transition: background 0.15s, opacity 0.15s; }
        .btn-run:hover:not(:disabled) { background: #3d8fee; }
        .btn-run:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-clear { background: none; border: 1px solid #1e2030; color: #4a5068; border-radius: 8px; font-size: 13px; padding: 10px 16px; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
        .btn-clear:hover { border-color: #2e3248; color: #c8cad8; }
        .output-section { background: #0f1017; border: 1px solid #1e2030; border-radius: 12px; overflow: hidden; }
        .output-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #1e2030; background: #0c0d14; }
        .output-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #4a5068; }
        .btn-copy { background: none; border: 1px solid #1e2030; color: #4a5068; border-radius: 6px; font-size: 11px; padding: 4px 10px; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
        .btn-copy:hover { border-color: #2e3248; color: #c8cad8; }
        .status-bar { padding: 10px 16px; font-size: 13px; color: #4d9fff; border-bottom: 1px solid #1e2030; background: #0d1220; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .output-body { padding: 20px; font-size: 14px; line-height: 1.8; color: #c8cad8; max-height: 500px; overflow-y: auto; }
        .output-body::-webkit-scrollbar { width: 4px; }
        .output-body::-webkit-scrollbar-thumb { background: #1e2030; border-radius: 4px; }
        .spinner { width: 12px; height: 12px; border: 2px solid #ffffff44; border-top-color: #fff; border-radius: 50%; display: inline-block; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-primary { display: inline-block; background: #4d9fff; color: #fff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 700; transition: background 0.15s; }
        .btn-primary:hover { background: #3d8fee; }
        @media (max-width: 640px) { .sidebar { display: none; } .main-panel { padding: 24px 20px; } }
      `}</style>
    </div>
  );
}



export default function WorkspacePage() {
  return (
    <Suspense fallback={<div style={{background:"#0a0b0f",height:"100vh"}}/>}>
      <WorkspaceInner />
    </Suspense>
  );
}
