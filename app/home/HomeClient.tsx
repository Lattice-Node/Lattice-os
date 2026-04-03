"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  label: string;
  credits: number;
  type: "daily" | "onetime";
  completed: boolean;
  claimable: boolean;
}

interface Props {
  name: string;
  avatarUrl: string | null;
  credits: number;
  plan: string;
  agentCount: number;
}

const MENU_ITEMS = [
  { href: "/agents", label: "マイAgent", color: "#6c71e8", bg: "rgba(108,113,232,0.12)", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.6"><circle cx="11" cy="11" r="8"/><path d="M11 7v4l3 2"/></svg> },
  { href: "/inbox", label: "受信箱", color: "#4ade80", bg: "rgba(74,222,128,0.10)", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.6"><path d="M4 6h14M4 11h14M4 16h10"/></svg> },
  { href: "#tasks", label: "タスク", color: "#f59e0b", bg: "rgba(245,158,11,0.10)", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.6"><path d="M5 11l4 4 8-8"/><rect x="3" y="3" width="16" height="16" rx="3"/></svg> },
  { href: "/store", label: "ストア", color: "#a855f7", bg: "rgba(168,85,247,0.10)", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5"/></svg> },
  { href: "/agents/new", label: "新規作成", color: "#6c71e8", bg: "rgba(108,113,232,0.08)", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><path d="M11 4v14M4 11h14"/></svg> },
  { href: "/settings", label: "設定", color: "#6a7080", bg: "rgba(74,80,96,0.15)", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.6"><circle cx="11" cy="11" r="3"/><path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.6 5.6l1.4 1.4M15 15l1.4 1.4M5.6 16.4l1.4-1.4M15 7l1.4-1.4"/></svg> },
];

const PRESET_AVATARS: Record<string, { emoji: string; bg: string }> = {
  "avatar:wolf": { emoji: "\u{1F43A}", bg: "#1e2044" }, "avatar:cat": { emoji: "\u{1F431}", bg: "#2a1e3a" },
  "avatar:dog": { emoji: "\u{1F436}", bg: "#1e2a1a" }, "avatar:fox": { emoji: "\u{1F98A}", bg: "#2a2010" },
  "avatar:robot": { emoji: "\u{1F916}", bg: "#1a2a2a" }, "avatar:alien": { emoji: "\u{1F47E}", bg: "#2a1a2a" },
  "avatar:rocket": { emoji: "\u{1F680}", bg: "#1e2044" }, "avatar:star": { emoji: "\u2B50", bg: "#2a2a10" },
  "avatar:fire": { emoji: "\u{1F525}", bg: "#2a1a10" }, "avatar:bolt": { emoji: "\u26A1", bg: "#2a2a10" },
  "avatar:gem": { emoji: "\u{1F48E}", bg: "#1a1a2a" }, "avatar:globe": { emoji: "\u{1F30F}", bg: "#1a2a2a" },
};

function Avatar({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  if (url && url.startsWith("data:image")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover" }} />;
  if (url && PRESET_AVATARS[url]) {
    const p = PRESET_AVATARS[url];
    return <div style={{ width: size, height: size, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55 }}>{p.emoji}</div>;
  }
  if (url && url.startsWith("http")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover" }} />;
  const initial = (name || "U")[0].toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "#6c71e8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.4, fontWeight: 700 }}>{initial}</div>;
}

export default function HomeClient({ name, avatarUrl, credits: initCredits, plan, agentCount }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [remainingCredits, setRemainingCredits] = useState(0);
  const [credits, setCredits] = useState(initCredits);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimFeedback, setClaimFeedback] = useState<{ id: string; cr: number } | null>(null);
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        setCompletedCount(data.completedCount);
        setTotal(data.total);
        setRemainingCredits(data.remainingCredits);
        setCredits(data.userCredits);

        // Auto-claim daily_login
        const login = data.tasks.find((t: Task) => t.id === "daily_login" && !t.completed && t.claimable);
        if (login) claimTask("daily_login");
      }
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const claimTask = async (taskId: string) => {
    if (claiming) return;
    setClaiming(taskId);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimFeedback({ id: taskId, cr: data.credits });
        setTimeout(() => setClaimFeedback(null), 2000);
        fetchTasks();
      }
    } catch {} finally { setClaiming(null); }
  };

  const handleMenuClick = (href: string) => {
    if (href === "#tasks") {
      document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(href);
  };

  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0e1117", color: "#e8eaf0", paddingBottom: 100 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "24px 20px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar url={avatarUrl} name={name} size={40} />
            <div>
              <p style={{ fontSize: 12, color: "#6a7080", margin: "0 0 1px" }}>おかえりなさい</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#e8eaf0", margin: 0, letterSpacing: "-0.02em" }}>{name || "ユーザー"}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(74,222,128,0.10)", padding: "6px 14px", borderRadius: 20 }}>
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 700 }}>{credits} cr</span>
          </div>
        </div>

        {/* Task progress banner */}
        <div style={{ background: "rgba(108,113,232,0.08)", border: "1px solid rgba(108,113,232,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 13, color: "#6c71e8", fontWeight: 600, margin: "0 0 2px" }}>今日のタスク</p>
              <p style={{ fontSize: 11, color: "#6a7080", margin: 0 }}>{completedCount}/{total} 完了{remainingCredits > 0 ? ` → あと +${remainingCredits}cr 獲得可能` : " → 全完了!"}</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `conic-gradient(#6c71e8 ${pct * 3.6}deg, rgba(108,113,232,0.15) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0e1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: "#6c71e8", fontWeight: 700 }}>{pct}%</span>
              </div>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(108,113,232,0.15)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, background: "#6c71e8", width: `${pct}%`, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Menu grid */}
        <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>メニュー</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {MENU_ITEMS.map(item => (
            <div key={item.href} onClick={() => handleMenuClick(item.href)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", transition: "transform 0.15s" }}>
                {item.icon(item.color)}
              </div>
              <span style={{ fontSize: 10, color: "#9096a8" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 28 }}>
          <div style={{ background: "#1c2028", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#e8eaf0", margin: "0 0 2px" }}>{agentCount}</p>
            <p style={{ fontSize: 10, color: "#6a7080", margin: 0 }}>エージェント</p>
          </div>
          <div style={{ background: "#1c2028", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#4ade80", margin: "0 0 2px" }}>{credits}</p>
            <p style={{ fontSize: 10, color: "#6a7080", margin: 0 }}>クレジット</p>
          </div>
          <div style={{ background: "#1c2028", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#6c71e8", margin: "0 0 2px", textTransform: "capitalize" }}>{plan === "free" ? "Free" : plan === "starter" ? "Starter" : plan === "pro" ? "Pro" : "Biz"}</p>
            <p style={{ fontSize: 10, color: "#6a7080", margin: 0 }}>プラン</p>
          </div>
        </div>

        {/* Tasks */}
        <div id="tasks-section">
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>タスク</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tasks.map(task => (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: 10,
                background: task.completed ? "rgba(74,222,128,0.06)" : "#1c2028",
                border: `1px solid ${task.completed ? "rgba(74,222,128,0.15)" : "#2e3440"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  {task.completed ? (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0a1a0e" strokeWidth="2"><path d="M2 6l3 3 5-5"/></svg>
                    </div>
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #4a5060", flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 13, color: task.completed ? "#6a7080" : "#e8eaf0", textDecoration: task.completed ? "line-through" : "none" }}>
                    {task.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {claimFeedback?.id === task.id ? (
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, animation: "fadeUp 0.5s ease" }}>+{claimFeedback.cr} cr!</span>
                  ) : task.completed ? (
                    <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>+{task.credits} cr</span>
                  ) : task.claimable ? (
                    <button onClick={() => claimTask(task.id)} disabled={claiming === task.id} style={{
                      padding: "4px 12px", borderRadius: 6, border: "none",
                      background: "#f59e0b", color: "#1a1400", fontSize: 11, fontWeight: 700,
                      cursor: claiming === task.id ? "default" : "pointer", fontFamily: "inherit",
                      opacity: claiming === task.id ? 0.5 : 1,
                    }}>
                      {claiming === task.id ? "..." : `+${task.credits} cr`}
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: "#4a5060", fontWeight: 600 }}>+{task.credits} cr</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
