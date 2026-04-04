"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Task { id: string; label: string; credits: number; type: string; category: string; completed: boolean; claimable: boolean; count?: number; unclaimed?: number; }
interface Props { name: string; avatarUrl: string | null; credits: number; plan: string; agentCount: number; isLoggedIn: boolean; }

const MENU = [
  { href: "/agents", label: "マイAgent", color: "#818cf8", bg: "#1e2252", border: "#3b3fa0", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M11 7v4l3 2"/></svg> },
  { href: "/inbox", label: "受信箱", color: "#6ee7b7", bg: "#0f2a1e", border: "#1a5c3a", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><path d="M4 6h14M4 11h14M4 16h10"/></svg> },
  { href: "#tasks", label: "タスク", color: "#fbbf24", bg: "#2a2008", border: "#5c4a10", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><path d="M5 11l4 4 8-8"/><rect x="3" y="3" width="16" height="16" rx="3"/></svg> },
  { href: "/store", label: "ストア", color: "#c084fc", bg: "#261540", border: "#5a2d8c", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5"/></svg> },
  { href: "/agents/new", label: "新規作成", color: "#818cf8", bg: "#1a1d40", border: "#3b3fa0", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="2"><path d="M11 4v14M4 11h14"/></svg> },
  { href: "#invite", label: "招待", color: "#fca5a5", bg: "#2a0f0f", border: "#7c2d2d", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><circle cx="9" cy="8" r="4"/><path d="M2 19c0-3.3 3.1-6 7-6s7 2.7 7 6"/><path d="M16 7v6M13 10h6"/></svg> },
  { href: "/pricing", label: "プラン", color: "#6ee7b7", bg: "#0a2018", border: "#1a5c3a", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><rect x="3" y="5" width="16" height="12" rx="2"/><path d="M3 9h16"/></svg> },
  { href: "/settings", label: "設定", color: "#a1a5b0", bg: "#1a1c22", border: "#3a3d48", icon: (c: string) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8"><circle cx="11" cy="11" r="3"/><path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.6 5.6l1.4 1.4M15 15l1.4 1.4M5.6 16.4l1.4-1.4M15 7l1.4-1.4"/></svg> },
];

const AVATARS: Record<string, { emoji: string; bg: string }> = {
  "avatar:wolf": { emoji: "🐺", bg: "#1e2044" }, "avatar:cat": { emoji: "🐱", bg: "#2a1e3a" }, "avatar:dog": { emoji: "🐶", bg: "#1e2a1a" },
  "avatar:fox": { emoji: "🦊", bg: "#2a2010" }, "avatar:robot": { emoji: "🤖", bg: "#1a2a2a" }, "avatar:alien": { emoji: "👾", bg: "#2a1a2a" },
};

function Av({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  if (url?.startsWith("data:image")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover" }} />;
  if (url && AVATARS[url]) return <div style={{ width: size, height: size, borderRadius: "50%", background: AVATARS[url].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55 }}>{AVATARS[url].emoji}</div>;
  if (url?.startsWith("http")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%" }} />;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "#6c71e8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.4, fontWeight: 700 }}>{(name || "U")[0].toUpperCase()}</div>;
}

export default function HomeClient({ name, avatarUrl, credits: initCr, plan, agentCount, isLoggedIn }: Props) {
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
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const d = await res.json();
      setDaily(d.daily || []); setStart(d.start || []); setFeature(d.feature || []); setSocial(d.social || []);
      setDailyDone(d.dailyCompleted || 0); setDailyTotal(d.dailyTotal || 0);
      setCredits(d.userCredits); setReferralCode(d.referralCode); setReferralCount(d.referralCount || 0);
      const login = (d.daily || []).find((t: Task) => t.id === "daily_login" && !t.completed && t.claimable);
      if (login) claim("daily_login");
    } catch {}
  }, []);

  useEffect(() => { if (isLoggedIn) fetchTasks(); }, [fetchTasks, isLoggedIn]);

  // Apply referral code from login page ?ref= param
  useEffect(() => {
    const ref = sessionStorage.getItem("lattice_ref");
    if (!ref) return;
    sessionStorage.removeItem("lattice_ref");
    fetch("/api/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: ref }) })
      .then(r => r.json()).then(d => {
        if (d.success) { setRefApplied(true); setCredits(c => c + 10); setTimeout(() => setRefApplied(false), 5000); }
      }).catch(() => {});
  }, []);

  const claim = async (taskId: string) => {
    if (claiming) return;
    setClaiming(taskId);
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId }) });
      const d = await res.json();
      if (d.success) { setFeedback({ id: taskId, cr: d.credits }); setTimeout(() => setFeedback(null), 2000); fetchTasks(); }
    } catch {} finally { setClaiming(null); }
  };

  const genReferral = async () => {
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate_referral" }) });
    const d = await res.json();
    if (d.referralCode) setReferralCode(d.referralCode);
  };

  const copyLink = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(`https://www.lattice-protocol.com/login?ref=${referralCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const guestAllowed = ["/store", "/pricing", "#tasks", "#invite"];
  const nav = (href: string) => {
    if (href === "#tasks") { document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (href === "#invite") { document.getElementById("invite-section")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (!isLoggedIn && !guestAllowed.includes(href)) { router.push("/login"); return; }
    router.push(href);
  };

  const pct = dailyTotal > 0 ? Math.round((dailyDone / dailyTotal) * 100) : 0;
  const taskList = tab === "daily" ? daily : tab === "start" ? start : feature;

  return (
    <div style={{ minHeight: "100vh", background: "#0e1117", color: "#e8eaf0", paddingBottom: 100 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "24px 20px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          {isLoggedIn ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Av url={avatarUrl} name={name} size={40} />
                <div>
                  <p style={{ fontSize: 12, color: "#6a7080", margin: "0 0 1px" }}>おかえりなさい</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: "#e8eaf0", margin: 0 }}>{name || "ユーザー"}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0f2a1e", border: "1px solid #1a5c3a", padding: "6px 14px", borderRadius: 20 }}>
                <span style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 700 }}>{credits} cr</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: "#6c71e8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#e8eaf0", margin: 0 }}>Lattice</p>
              </div>
              <button onClick={() => router.push("/login")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#6c71e8", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                ログイン
              </button>
            </>
          )}
        </div>

        {isLoggedIn && refApplied && (
          <div style={{ background: "#0f2a1e", border: "1px solid #1a5c3a", borderRadius: 10, padding: "12px 16px", marginBottom: 12, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#6ee7b7", fontWeight: 700, margin: "0 0 2px" }}>+10cr ボーナス獲得!</p>
            <p style={{ fontSize: 11, color: "#4a7a5a", margin: 0 }}>招待コードが適用されました</p>
          </div>
        )}

        {/* Welcome banner (guest) or Daily progress (logged in) */}
        {isLoggedIn ? (
          <div style={{ background: "#1a1f52", border: "1px solid #3b40a0", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 14, color: "#a5b4fc", fontWeight: 700, margin: "0 0 3px" }}>今日のデイリー</p>
                <p style={{ fontSize: 12, color: "#9096a8", margin: 0 }}>{dailyDone}/{dailyTotal} 完了</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `conic-gradient(#818cf8 ${pct * 3.6}deg, #2a2f5c 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#141838", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700 }}>{pct}%</span>
                </div>
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "#2a2f5c" }}>
              <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #818cf8, #a5b4fc)", width: `${pct}%`, transition: "width 0.5s" }} />
            </div>
          </div>
        ) : (
          <div style={{ background: "#1a1f52", border: "1px solid #3b40a0", borderRadius: 14, padding: "20px 18px", marginBottom: 24, textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#a5b4fc", margin: "0 0 4px" }}>AIエージェントで業務を自動化</p>
            <p style={{ fontSize: 12, color: "#6a7080", margin: "0 0 14px" }}>ログインすると30クレジットで無料スタート</p>
            <button onClick={() => router.push("/login")} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#6c71e8", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              無料で始める
            </button>
          </div>
        )}

        {/* Menu grid */}
        <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>メニュー</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {MENU.map(m => (
            <div key={m.href} onClick={() => nav(m.href)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>{m.icon(m.color)}</div>
              <span style={{ fontSize: 10, color: "#c0c4d0", fontWeight: 500 }}>{m.label}</span>
            </div>
          ))}
        </div>

        {isLoggedIn && (<>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 28 }}>
          <div style={{ background: "#1e2252", border: "1px solid #3b3fa0", borderRadius: 12, padding: "14px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#818cf8", margin: "0 0 2px" }}>{agentCount}</p>
            <p style={{ fontSize: 10, color: "#c0c4d0", fontWeight: 500, margin: 0 }}>エージェント</p>
          </div>
          <div style={{ background: "#0f2a1e", border: "1px solid #1a5c3a", borderRadius: 12, padding: "14px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#6ee7b7", margin: "0 0 2px" }}>{credits}</p>
            <p style={{ fontSize: 10, color: "#c0c4d0", fontWeight: 500, margin: 0 }}>クレジット</p>
          </div>
          <div style={{ background: "#2a0f0f", border: "1px solid #7c2d2d", borderRadius: 12, padding: "14px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#fca5a5", margin: "0 0 2px" }}>{referralCount}</p>
            <p style={{ fontSize: 10, color: "#c0c4d0", fontWeight: 500, margin: 0 }}>招待</p>
          </div>
        </div>

        {/* Tasks */}
        <div id="tasks-section">
          <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>タスク</p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: "1px solid #2e3440" }}>
            {([["daily", "デイリー"], ["start", "初回"], ["feature", "機能"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: "8px 0", background: "none", border: "none",
                borderBottom: tab === key ? "2px solid #6c71e8" : "2px solid transparent",
                color: tab === key ? "#6c71e8" : "#4a5060", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
            {taskList.map(t => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: 10,
                background: t.completed ? "#0f2a1a" : "#161a24",
                border: `1px solid ${t.completed ? "#1a5c3a" : "#2a2f3c"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  {t.completed ? (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0a1a0e" strokeWidth="2"><path d="M2 6l3 3 5-5"/></svg>
                    </div>
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #4a5060", flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 13, color: t.completed ? "#6a7080" : "#e8eaf0", textDecoration: t.completed ? "line-through" : "none" }}>{t.label}</span>
                </div>
                {feedback?.id === t.id ? (
                  <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>+{feedback.cr}cr!</span>
                ) : t.completed ? (
                  <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>+{t.credits}cr</span>
                ) : t.claimable ? (
                  <button onClick={() => claim(t.id)} disabled={claiming === t.id} style={{
                    padding: "4px 12px", borderRadius: 6, border: "none", background: "#f59e0b",
                    color: "#1a1400", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    opacity: claiming === t.id ? 0.5 : 1,
                  }}>{claiming === t.id ? "..." : `+${t.credits}cr`}</button>
                ) : (
                  <span style={{ fontSize: 11, color: "#6a7080" }}>+{t.credits}cr</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        <div id="invite-section">
          <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>友達を招待</p>
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#f87171" strokeWidth="1.6"><circle cx="9" cy="8" r="4"/><path d="M2 19c0-3.3 3.1-6 7-6s7 2.7 7 6"/><path d="M16 7v6M13 10h6"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0", margin: "0 0 2px" }}>1人招待で +10cr</p>
                <p style={{ fontSize: 11, color: "#6a7080", margin: 0 }}>招待された友達にも+10crプレゼント</p>
              </div>
            </div>

            {referralCode ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "#0e1117", border: "1px solid #2e3440" }}>
                    <p style={{ fontSize: 11, color: "#6a7080", margin: "0 0 2px" }}>招待コード</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", margin: 0, letterSpacing: "0.1em", fontFamily: "monospace" }}>{referralCode}</p>
                  </div>
                  <button onClick={copyLink} style={{
                    padding: "10px 16px", borderRadius: 8, border: "none",
                    background: copied ? "#4ade80" : "#f87171", color: copied ? "#0a1a0e" : "#fff",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                  }}>{copied ? "コピー済み!" : "リンクをコピー"}</button>
                </div>
                {referralCount > 0 && (
                  <p style={{ fontSize: 12, color: "#4ade80", margin: "0 0 8px" }}>{referralCount}人が参加しました</p>
                )}
                {/* Claim invite rewards */}
                {social.length > 0 && social[0].claimable && (
                  <button onClick={() => claim("invite")} disabled={claiming === "invite"} style={{
                    width: "100%", padding: "10px", borderRadius: 8, border: "none",
                    background: "#f59e0b", color: "#1a1400", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>{claiming === "invite" ? "..." : `招待報酬を受け取る (+${social[0].unclaimed! * 10}cr)`}</button>
                )}
              </>
            ) : (
              <button onClick={genReferral} style={{
                width: "100%", padding: "12px", borderRadius: 8, border: "none",
                background: "#f87171", color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>招待コードを発行する</button>
            )}
          </div>
        </div>

        {/* Roadmap */}
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>今後の予定</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "フィードバック機能", desc: "要望・バグ報告をアプリ内から送信", status: "soon", color: "#818cf8" },
              { label: "日本特化テンプレート追加", desc: "天気・電車遅延・花粉・ニュースなど15種+", status: "soon", color: "#818cf8" },
              { label: "SNS機能", desc: "ユーザー同士の交流・エージェント共有", status: "planned", color: "#6a7080" },
              { label: "クレジット売買", desc: "クレジットの購入・ポイント交換", status: "planned", color: "#6a7080" },
              { label: "Lattice Protocol v0", desc: "AIエージェント間通信の公開API", status: "planned", color: "#6a7080" },
              { label: "Lattice Token (LTC)", desc: "プラットフォーム内通貨のトークン化", status: "future", color: "#4a5060" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#161a24", border: "1px solid #2a2f3c" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", margin: "0 0 1px" }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: "#6a7080", margin: 0 }}>{item.desc}</p>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: item.status === "soon" ? "#818cf8" : item.status === "planned" ? "#6a7080" : "#4a5060", background: item.status === "soon" ? "#1e2252" : "#1a1c22", padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap", textTransform: "uppercase" }}>
                  {item.status === "soon" ? "まもなく" : item.status === "planned" ? "開発中" : "将来"}
                </span>
              </div>
            ))}
          </div>
        </div>
        </>)}

      </div>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
