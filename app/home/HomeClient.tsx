"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { hapticImpact } from "@/lib/native";
import { nativeFetch } from "@/lib/native-fetch";

interface Task { id: string; label: string; credits: number; type: string; category: string; completed: boolean; claimable: boolean; count?: number; unclaimed?: number; }
interface Props { name: string; avatarUrl: string | null; credits: number; plan: string; agentCount: number; isLoggedIn: boolean; }

const MENU = [
  { href: "/node", label: "ノード", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><circle cx="10" cy="10" r="6"/><circle cx="10" cy="10" r="2"/><line x1="10" y1="4" x2="10" y2="6"/><line x1="10" y1="14" x2="10" y2="16"/><line x1="4" y1="10" x2="6" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/></svg> },
  { href: "/agents", label: "マイAgent", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 1.5"/></svg> },
  { href: "/inbox", label: "受信箱", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><path d="M3 5h14M3 10h14M3 15h9"/></svg> },
  { href: "#tasks", label: "タスク", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><path d="M4 10l4 4 8-8"/></svg> },
  { href: "/agents/new", label: "新規作成", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.5"><path d="M10 4v12M4 10h12"/></svg> },
  { href: "#invite", label: "招待", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><circle cx="8" cy="7" r="3.5"/><path d="M2 17c0-3 2.5-5 6-5s6 2 6 5"/><path d="M14 6v5M11.5 8.5h5"/></svg> },
  { href: "/pricing", label: "プラン", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M3 8h14"/></svg> },
  { href: "/settings", label: "設定", icon: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-primary)" strokeWidth="1.2"><circle cx="10" cy="10" r="2.5"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.3 5.3l1.4 1.4M13.3 13.3l1.4 1.4M5.3 14.7l1.4-1.4M13.3 6.7l1.4-1.4"/></svg> },
];

function Av({ url, name, size = 36 }: { url: string | null; name: string; size?: number }) {
  if (url?.startsWith("data:image")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover" }} />;
  if (url?.startsWith("http")) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%" }} />;
  const initial = (name || "U")[0].toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--btn-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--btn-text)", fontSize: size * 0.4, fontWeight: 600 }}>{initial}</div>;
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
    navigator.clipboard.writeText(`https://www.lattice-protocol.com/login?ref=${referralCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const guestAllowed = ["/node", "/store", "/pricing", "#tasks", "#invite"];
  const nav = (href: string) => {
    hapticImpact("light");
    if (href === "#tasks") { document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (href === "#invite") { document.getElementById("invite-section")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (!isLoggedIn && !guestAllowed.includes(href)) { router.push("/login"); return; }
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
        ? { minHeight: "100vh", paddingBottom: 100 }
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
              <button onClick={() => router.push("/login")} style={{ padding: "7px 18px", borderRadius: 999, border: "none", background: "var(--btn-bg)", color: "var(--btn-text)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
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
            <button onClick={() => router.push("/login")} style={{ padding: "10px 24px", borderRadius: 999, border: "none", background: "var(--btn-bg)", color: "var(--btn-text)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              無料で始める
            </button>
          </div>
        )}

        {/* メニューグリッド */}
        <p style={{ ...S.label, margin: "0 0 8px" }}>メニュー</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
          {MENU.map(m => (
            <div key={m.href} onClick={() => nav(m.href)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", transition: "background .2s, border-color .2s" }}>{m.icon()}</div>
              <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>{m.label}</span>
            </div>
          ))}
        </div>

        {isLoggedIn && (<>
        {/* 統計 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 8px", textAlign: "center", transition: "background .2s" }}>
            <p style={{ ...S.mono, fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 2px" }}>{agentCount}</p>
            <p style={{ ...S.mono, fontSize: 9, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>エージェント</p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 8px", textAlign: "center", transition: "background .2s" }}>
            <p style={{ ...S.mono, fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 2px" }}>{credits}</p>
            <p style={{ ...S.mono, fontSize: 9, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>クレジット</p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 8px", textAlign: "center", transition: "background .2s" }}>
            <p style={{ ...S.mono, fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 2px" }}>{referralCount}</p>
            <p style={{ ...S.mono, fontSize: 9, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>招待済み</p>
          </div>
        </div>

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

        {/* 招待 */}
        <div id="invite-section">
          <p style={{ ...S.label, margin: "0 0 8px" }}>友達を招待</p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.4"><circle cx="8" cy="7" r="3.5"/><path d="M2 17c0-3 2.5-5 6-5s6 2 6 5"/><path d="M14 6v5M11.5 8.5h5"/></svg>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 1px" }}>1人招待で +10cr</p>
                <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>友達にも+10crプレゼント</p>
              </div>
            </div>

            {referralCode ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ flex: 1, padding: "8px 12px", borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <p style={{ ...S.mono, fontSize: 9, color: "var(--text-secondary)", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.08em" }}>招待コード</p>
                    <p style={{ ...S.mono, fontSize: 16, fontWeight: 700, color: "var(--text-display)", margin: 0, letterSpacing: "0.1em" }}>{referralCode}</p>
                  </div>
                  <button onClick={copyLink} style={{
                    padding: "8px 14px", borderRadius: 999, border: "none",
                    background: copied ? "var(--success)" : "var(--accent)", color: "#fff",
                    fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                  }}>{copied ? "コピー済み" : "コピー"}</button>
                </div>
                {referralCount > 0 && (
                  <p style={{ ...S.mono, fontSize: 11, color: "var(--success)", margin: "0 0 6px" }}>{referralCount}人が参加</p>
                )}
                {social.length > 0 && social[0].claimable && (
                  <button onClick={() => claim("invite")} disabled={claiming === "invite"} style={{
                    width: "100%", padding: "8px", borderRadius: 999, border: "none",
                    background: "var(--warning)", color: "#1a1400", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>{claiming === "invite" ? "..." : `招待報酬を受け取る (+${social[0].unclaimed! * 10}cr)`}</button>
                )}
              </>
            ) : (
              <button onClick={genReferral} style={{
                width: "100%", padding: "10px", borderRadius: 999, border: "none",
                background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}>招待コードを発行する</button>
            )}
          </div>
        </div>

        {/* ロードマップ */}
        <div style={{ marginTop: 24 }}>
          <p style={{ ...S.label, margin: "0 0 8px" }}>今後の予定</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "フィードバック機能", status: "まもなく" },
              { label: "日本特化テンプレート追加", status: "まもなく" },
              { label: "SNS機能", status: "開発中" },
              { label: "クレジット売買", status: "開発中" },
              { label: "Lattice Protocol v0", status: "開発中" },
              { label: "Lattice Token (LTC)", status: "将来" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{item.label}</span>
                <span style={{ ...S.mono, fontSize: 9, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
        </>)}

      </div>
    </div>
  );
}
