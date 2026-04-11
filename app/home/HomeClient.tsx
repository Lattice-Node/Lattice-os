"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { hapticImpact } from "@/lib/native";
import { nativeFetch } from "@/lib/native-fetch";
import { isPaymentUiVisible } from "@/lib/monetization";
import { getPlanLimits } from "@/lib/plan-limits";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { useAchievement } from "@/components/AchievementToast";

interface Task { id: string; label: string; credits: number; type: string; category: string; completed: boolean; claimable: boolean; count?: number; unclaimed?: number; }
interface StreakInfo { currentStreak: number; longestStreak: number; }
interface AchievementInfo { id: string; icon: string; title: string; description: string; }
interface Props { name: string; avatarUrl: string | null; credits: number; plan: string; agentCount: number; isLoggedIn: boolean; nextExecution?: { agentName: string; scheduledAt: string } | null; streak?: StreakInfo | null; newAchievement?: AchievementInfo | null; }

const MENU = [
  { href: "/node/", label: "ノード", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><circle cx="10" cy="10" r="6"/><circle cx="10" cy="10" r="2"/><line x1="10" y1="4" x2="10" y2="6"/><line x1="10" y1="14" x2="10" y2="16"/><line x1="4" y1="10" x2="6" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/></svg> },
  { href: "/agents/", label: "マイAgent", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 1.5"/></svg> },
  { href: "/inbox/", label: "受信箱", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><path d="M3 5h14M3 10h14M3 15h9"/></svg> },
  { href: "#tasks", label: "タスク", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><path d="M4 10l4 4 8-8"/></svg> },
  { href: "/agents/new/", label: "新規作成", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.5"><path d="M10 4v12M4 10h12"/></svg> },
  { href: "/pricing/", label: "プラン", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M3 8h14"/></svg> },
  { href: "/settings/", label: "設定", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><circle cx="10" cy="10" r="2.5"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.3 5.3l1.4 1.4M13.3 13.3l1.4 1.4M5.3 14.7l1.4-1.4M13.3 6.7l1.4-1.4"/></svg> },
];

function Av({ url, name, size = 36 }: { url: string | null; name: string; size?: number }) {
  if (url?.startsWith("data:image")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover" }} />;
  if (url?.startsWith("http")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%" }} />;
  const initial = (name || "U")[0].toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--btn-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--btn-text)", fontSize: size * 0.4, fontWeight: 600 }}>{initial}</div>;
}

export default function HomeClient({ name, avatarUrl, credits: initCr, plan, agentCount, isLoggedIn, nextExecution, streak, newAchievement }: Props) {
  const { show: showAchievement } = useAchievement();

  // Show achievement toast on first render if new
  useEffect(() => {
    if (newAchievement) {
      setTimeout(() => showAchievement(newAchievement), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [daily, setDaily] = useState<Task[]>([]);
  const [start, setStart] = useState<Task[]>([]);
  const [feature, setFeature] = useState<Task[]>([]);
  const [social, setSocial] = useState<Task[]>([]);
  const [dailyDone, setDailyDone] = useState(0);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [credits, setCredits] = useState(initCr);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; cr: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [refApplied, setRefApplied] = useState(false);
  const [tab, setTab] = useState<"daily" | "start" | "feature">("daily");
  const [now, setNow] = useState(Date.now());

  // Live countdown for next execution
  useEffect(() => {
    if (!nextExecution) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [nextExecution]);
  const [usage, setUsage] = useState<{ monthlyRunsUsed: number; monthlyRunsCap: number; cancelled?: boolean; planExpiresAt?: string | null; nextResetAt?: string } | null>(null);
  // Tier 0: filter pricing menu entry when payment UI is disabled
  const [paymentVisible, setPaymentVisible] = useState(false);
  useEffect(() => { setPaymentVisible(isPaymentUiVisible()); }, []);
  useEffect(() => {
    if (!isLoggedIn) return;
    nativeFetch("/api/usage").then(r => r.ok ? r.json() : null).then(d => {
      if (d && typeof d.monthlyRunsCap === "number") setUsage(d);
    }).catch(() => {});
  }, [isLoggedIn]);
  const visibleMenu = paymentVisible ? MENU : MENU.filter((m) => m.href !== "/pricing/");
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await nativeFetch("/api/tasks");
      const d = await res.json();
      setDaily(d.daily || []); setStart(d.start || []); setFeature(d.feature || []); setSocial(d.social || []);
      setDailyDone(d.dailyCompleted || 0); setDailyTotal(d.dailyTotal || 0);
      setCredits(d.userCredits); setReferralCode(d.referralCode); setReferralCount(d.referralCount || 0);
      const login = (d.daily || []).find((t: Task) => t.id === "daily_login" && !t.completed && t.claimable);
      if (login) claim("daily_login");
    } catch {}
  }, []);

  useEffect(() => { if (isLoggedIn) fetchTasks(); }, [fetchTasks, isLoggedIn]);

  useEffect(() => {
    const ref = sessionStorage.getItem("lattice_ref");
    if (!ref) return;
    sessionStorage.removeItem("lattice_ref");
    nativeFetch("/api/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: ref }) })
      .then(r => r.json()).then(d => {
        if (d.success) { setRefApplied(true); setCredits(c => c + 10); setTimeout(() => setRefApplied(false), 5000); }
      }).catch(() => {});
  }, []);

  const claim = async (taskId: string) => {
    if (claiming) return;
    setClaiming(taskId);
    try {
      const res = await nativeFetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId }) });
      const d = await res.json();
      if (d.success) { setFeedback({ id: taskId, cr: d.credits }); setTimeout(() => setFeedback(null), 2000); fetchTasks(); }
    } catch {} finally { setClaiming(null); }
  };

  const genReferral = async () => {
    const res = await nativeFetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate_referral" }) });
    const d = await res.json();
    if (d.referralCode) setReferralCode(d.referralCode);
  };

  const copyLink = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(`https://www.lattice-protocol.com/login/?ref=${referralCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const guestAllowed = ["/node/", "/store/", "/pricing/", "#tasks"];
  const nav = (href: string) => {
    hapticImpact("light");
    if (href === "#tasks") { document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (!isLoggedIn && !guestAllowed.includes(href)) { router.push("/login/"); return; }
    router.push(href);
  };

  const pct = dailyTotal > 0 ? Math.round((dailyDone / dailyTotal) * 100) : 0;
  const taskList = tab === "daily" ? daily : tab === "start" ? start : feature;

  const S = {
    mono: { fontFamily: "'Space Mono', monospace" } as const,
    label: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.1em" },
  };

  return (
    <div style={{
      ...(isLoggedIn
        ? { minHeight: "100%", paddingBottom: 20 }
        : { position: "fixed" as const, inset: 0, overflow: "hidden", overscrollBehavior: "none", touchAction: "none", paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }),
      background: "var(--bg)", color: "var(--text-primary)", transition: "background .25s, color .25s",
    }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 20px 0" }}>

        {/* ヘッダー */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          {isLoggedIn ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Av url={avatarUrl} name={name} size={36} />
                <div>
                  <p style={{ ...S.label, margin: "0 0 1px", fontSize: 9 }}>おかえりなさい</p>
                  <p style={{ fontSize: 18, fontWeight: 500, color: "var(--text-display)", margin: 0 }}>{name || "ユーザー"}</p>
                </div>
              </div>
              <div style={{ border: "1px solid var(--border-visible)", padding: "5px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ ...S.mono, fontSize: 13, color: "var(--text-primary)" }}>{credits}</span>
                <span style={{ ...S.mono, fontSize: 9, color: "var(--text-secondary)" }}>CR</span>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 20, fontWeight: 500, color: "var(--text-display)", margin: 0 }}>Lattice</p>
              <button onClick={() => router.push("/login/")} style={{ padding: "7px 18px", borderRadius: 999, border: "none", background: "var(--btn-bg)", color: "var(--btn-text)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                ログイン
              </button>
            </>
          )}
        </div>

        {isLoggedIn && refApplied && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--success)", borderRadius: 8, padding: "10px 14px", marginBottom: 10, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--success)", fontWeight: 600, margin: 0 }}>+10cr ボーナス獲得!</p>
          </div>
        )}

        {/* デイリー進捗 or ゲストバナー */}
        {isLoggedIn ? (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={S.label}>デイリー</span>
              <span style={{ ...S.mono, fontSize: 10, color: "var(--text-secondary)" }}>{dailyDone}/{dailyTotal}</span>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: dailyTotal || 5 }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, background: i < dailyDone ? "var(--progress-on)" : "var(--progress-off)", transition: "background .3s" }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 16px", marginBottom: 18, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-display)", margin: "0 0 4px" }}>AIエージェントで業務を自動化</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>ログインすると30クレジットで無料スタート</p>
            <button onClick={() => router.push("/login/")} style={{ padding: "10px 24px", borderRadius: 999, border: "none", background: "var(--btn-bg)", color: "var(--btn-text)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              無料で始める
            </button>
          </div>
        )}


        {isLoggedIn && (<>
        {/* Plan status card */}
        {(() => {
          const limits = getPlanLimits(plan);
          const planColor = plan === "pro" ? "#f59e0b" : plan === "starter" || plan === "personal" ? "#3b82f6" : "#64748b";
          const planNameColor = plan === "pro" ? "#f59e0b" : plan === "starter" || plan === "personal" ? "#3b82f6" : "#fff";
          const planBg = plan === "pro" ? "rgba(245,158,11,0.06)" : plan === "starter" || plan === "personal" ? "rgba(59,130,246,0.06)" : "var(--surface)";
          const agentCap = limits.agentCap;
          const isUnlimitedAgents = agentCap === -1;
          const runsUsed = usage?.monthlyRunsUsed ?? 0;
          const runsCap = usage?.monthlyRunsCap ?? limits.monthlyRunsCap;
          const isUnlimitedRuns = runsCap >= 99999;
          const planLabel = plan === "pro" ? "Pro" : plan === "starter" || plan === "personal" ? "Starter" : "Free";
          const isCancelled = usage?.cancelled && usage.planExpiresAt;
          const cancelDate = isCancelled ? (() => { const d = new Date(usage.planExpiresAt!); return `${d.getMonth() + 1}月${d.getDate()}日`; })() : null;
          const resetDate = usage?.nextResetAt ? (() => { const d = new Date(usage.nextResetAt); return `${d.getMonth() + 1}月${d.getDate()}日にリセット`; })() : null;
          return (
            <div style={{ background: planBg, border: `1px solid ${planColor}18`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              {/* Header row: plan name + optional cancel badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: planNameColor, margin: 0, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>{planLabel}</p>
                {isCancelled && (
                  <span style={{ fontSize: 10, color: "var(--warning)", background: "rgba(212,168,67,0.12)", padding: "3px 8px", borderRadius: 6, fontFamily: "'Space Mono', monospace" }}>
                    {cancelDate}まで
                  </span>
                )}
              </div>
              {/* Agents */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em" }}>エージェント</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-display)", fontFamily: "'Space Mono', monospace" }}>
                  <CountUp to={agentCount} duration={600} />{isUnlimitedAgents ? " / ∞" : ` / ${agentCap}`}
                </span>
              </div>
              {!isUnlimitedAgents && (
                <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (agentCount / Math.max(1, agentCap)) * 100)}%` }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }} style={{ height: "100%", background: planColor, borderRadius: 3 }} />
                </div>
              )}
              {isUnlimitedAgents && <div style={{ height: 12 }} />}
              {/* Monthly runs */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em" }}>今月の実行</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-display)", fontFamily: "'Space Mono', monospace" }}>
                  {isUnlimitedRuns ? <><CountUp to={runsUsed} duration={600} /> / 無制限</> : <><CountUp to={runsUsed} duration={600} /> / {runsCap}</>}
                </span>
              </div>
              {!isUnlimitedRuns && (
                <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (runsUsed / Math.max(1, runsCap)) * 100)}%` }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }} style={{ height: "100%", background: planColor, borderRadius: 3 }} />
                </div>
              )}
              {!isUnlimitedRuns && resetDate && (
                <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: "4px 0 0", fontFamily: "'Space Mono', monospace", opacity: 0.7 }}>{resetDate}</p>
              )}
            </div>
          );
        })()}

        {/* Streak card */}
        {streak && streak.currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            style={{
              background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.12, 1], rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 40, lineHeight: 1 }}
            >
              🔥
            </motion.span>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>
                  <CountUp to={streak.currentStreak} duration={600} />
                </span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>日</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
                連続ログイン{streak.longestStreak > streak.currentStreak ? ` · 最長 ${streak.longestStreak}日` : ""}
              </p>
            </div>
          </motion.div>
        )}

        {/* Next execution countdown */}
        {nextExecution && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <p style={{ ...S.label, margin: "0 0 8px" }}>次の実行</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-display)", margin: "0 0 6px" }}>{nextExecution.agentName}</p>
            <p style={{ ...S.mono, fontSize: 22, fontWeight: 700, color: "var(--btn-bg)", margin: 0, letterSpacing: "0.02em" }}>
              {(() => {
                const diff = new Date(nextExecution.scheduledAt).getTime() - now;
                if (diff <= 0) return "実行中...";
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                if (h > 0) return `${h}時間 ${m}分 ${s}秒`;
                if (m > 0) return `${m}分 ${s}秒`;
                return `${s}秒`;
              })()}
            </p>
          </div>
        )}

        {/* タスク */}
        <div id="tasks-section">
          <p style={{ ...S.label, margin: "0 0 8px" }}>タスク</p>
          <div style={{ display: "flex", border: "1px solid var(--border-visible)", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
            {([["daily", "デイリー"], ["start", "初回"], ["feature", "機能"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: "7px 0", background: tab === key ? "var(--tab-on-bg)" : "transparent", border: "none",
                color: tab === key ? "var(--tab-on-text)" : "var(--tab-off-text)",
                fontSize: 11, fontFamily: "'Space Mono', monospace", cursor: "pointer", transition: "all .15s",
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
            {taskList.map(t => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: 8,
                background: "var(--surface)", border: "1px solid var(--border)", transition: "background .2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  {t.completed ? (
                    <span style={{ ...S.mono, fontSize: 11, color: "var(--success)" }}>[OK]</span>
                  ) : (
                    <div style={{ width: 14, height: 14, border: "1.5px solid var(--border-visible)", borderRadius: 2, flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 12, color: t.completed ? "var(--text-disabled)" : "var(--text-primary)", textDecoration: t.completed ? "line-through" : "none" }}>{t.label}</span>
                </div>
                {feedback?.id === t.id ? (
                  <span style={{ ...S.mono, fontSize: 11, color: "var(--success)", fontWeight: 700 }}>+{feedback.cr}cr!</span>
                ) : t.completed ? (
                  <span style={{ ...S.mono, fontSize: 10, color: "var(--success)" }}>+{t.credits}</span>
                ) : t.claimable ? (
                  <button onClick={() => claim(t.id)} disabled={claiming === t.id} style={{
                    padding: "3px 10px", borderRadius: 999, border: "none", background: "var(--warning)",
                    color: "#1a1400", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono', monospace",
                    opacity: claiming === t.id ? 0.5 : 1,
                  }}>{claiming === t.id ? "..." : `+${t.credits}`}</button>
                ) : (
                  <span style={{ ...S.mono, fontSize: 10, color: "var(--text-disabled)" }}>+{t.credits}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* お知らせ */}
        <div style={{ marginTop: 8 }}>
          <p style={{ ...S.label, margin: "0 0 8px" }}>お知らせ</p>
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>新しいお知らせはありません</p>
          </div>
        </div>
        </>)}

      </div>
    </div>
  );
}
