"use client";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/theme";
import { nativeFetch, clearNativeSession } from "@/lib/native-fetch";

const isNativePlatform = (): boolean =>
  typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

interface Props {
  name: string;
  email: string;
  image: string;
  credits: number;
  distributedCredits: number;
  purchasedCredits: number;
  plan: string;
  currentPeriodEnd: string | null;
  role: string;
  profileSection?: React.ReactNode;
}

const CREDIT_PLANS = [
  { id: "credits_100", label: "100", price: "500", priceNum: 500, perUnit: "50", desc: "" },
  { id: "credits_500", label: "500", price: "2,000", priceNum: 2000, perUnit: "250", desc: "", popular: true },
  { id: "credits_1000", label: "1,000", price: "3,500", priceNum: 3500, perUnit: "500", desc: "" },
];

const SUB_PLANS = [
  {
    id: "free", label: "Free", price: 0, yearlyPrice: 0,
    runs: 15, agents: 3, badge: "",
    features: [
      { text: "AIエージェント 3体まで", ok: true },
      { text: "月15回の自動実行", ok: true },
      { text: "Web検索 + AI要約", ok: true },
      { text: "テンプレートストア", ok: true },
      { text: "Gmail / Discord連携", ok: false },
      { text: "Tool Use（自律実行）", ok: false },
      { text: "AI記憶 / AI学習", ok: false },
      { text: "LINE連携", ok: false },
    ],
  },
  {
    id: "starter", label: "Starter", price: 980, yearlyPrice: 9800,
    runs: 50, agents: 10, badge: "",
    features: [
      { text: "AIエージェント 10体まで", ok: true },
      { text: "月50回の自動実行", ok: true },
      { text: "Web検索 + AI要約", ok: true },
      { text: "テンプレートストア", ok: true },
      { text: "Gmail / Discord連携", ok: true },
      { text: "Tool Use（自律実行）", ok: false },
      { text: "AI記憶 / AI学習", ok: false },
      { text: "LINE連携", ok: false },
    ],
  },
  {
    id: "pro", label: "Pro", price: 2480, yearlyPrice: 24800,
    runs: 250, agents: -1, badge: "人気",
    features: [
      { text: "AIエージェント 無制限", ok: true },
      { text: "月250回の自動実行", ok: true },
      { text: "Web検索 + AI要約", ok: true },
      { text: "テンプレートストア", ok: true },
      { text: "Gmail / Discord連携", ok: true },
      { text: "Tool Use（自律実行）", ok: true },
      { text: "AI記憶 / AI学習", ok: true },
      { text: "LINE連携", ok: false },
    ],
  },
  {
    id: "business", label: "Business", price: 6980, yearlyPrice: 69800,
    runs: 1000, agents: -1, badge: "",
    features: [
      { text: "AIエージェント 無制限", ok: true },
      { text: "月1,000回の自動実行", ok: true },
      { text: "Web検索 + AI要約", ok: true },
      { text: "テンプレートストア", ok: true },
      { text: "Gmail / Discord連携", ok: true },
      { text: "Tool Use（自律実行）", ok: true },
      { text: "AI記憶 / AI学習", ok: true },
      { text: "LINE連携 + 優先サポート", ok: true },
    ],
  },
];

const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px", marginBottom: 12, transition: "background .25s, border-color .25s" };
const sectionLabel = { fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 14px" };

export default function SettingsClient({ name, email, image, credits, distributedCredits, purchasedCredits, plan, currentPeriodEnd, role, profileSection }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [subView, setSubView] = useState<string | null>(null);
  const [newsDetail, setNewsDetail] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showCredit, setShowCredit] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [connections, setConnections] = useState<{id:string,provider:string,metadata:string}[]>([]);
  const [disconnecting, setDisconnecting] = useState<string|null>(null);
  const [lineCode, setLineCode] = useState("");
  const [lineConnecting, setLineConnecting] = useState(false);
  const [lineSuccess, setLineSuccess] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const { theme, toggleTheme } = useApp();

  useEffect(() => {
    nativeFetch("/api/connections").then(r => r.json()).then(d => setConnections(d.connections || [])).catch(() => {});
  }, []);

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      await nativeFetch("/api/connections", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId: id }) });
      setConnections(c => c.filter(x => x.id !== id));
    } catch {} finally { setDisconnecting(null); }
  };

const handleLineGenerate = async () => {
    setLineConnecting(true);
    try {
      const res = await nativeFetch("/api/connections/line/code", { method: "POST" });
      const data = await res.json();
      if (data.code) setLineCode(data.code);
    } catch {} finally { setLineConnecting(false); }
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get("success");
  const errorParam = searchParams.get("error");

  const handleSignOut = async () => {
    try {
      if (isNativePlatform()) {
        await clearNativeSession();
        router.replace("/home/");
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      router.replace("/home/");
    }
  };

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId);
    try {
      const res = await nativeFetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) throw new Error("checkout failed");
      const data = await res.json();
      if (!data.url) throw new Error("no url returned");

      if (isNativePlatform()) {
        // Use Capacitor's Browser plugin to open Stripe in an in-app SafariViewController.
        // This is the only reliable way to open external URLs from a Capacitor WebView.
        try {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: data.url, presentationStyle: "popover" });
        } catch (browserErr) {
          console.error("[stripe] Browser plugin failed", browserErr);
          // Last-resort fallback
          window.location.href = data.url;
        }
      } else {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("[stripe] checkout failed", e);
      alert("決済ページを開けませんでした。もう一度お試しください。");
    } finally {
      setPurchasing(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    try {
      const res = await nativeFetch("/api/users/delete", { method: "DELETE" });
      if (res.ok) await handleSignOut();
    } catch { setDeleting(false); setConfirm(false); }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) { setCancelConfirm(true); return; }
    setCanceling(true);
    try {
      const res = await nativeFetch("/api/stripe/cancel", { method: "POST" });
      if (res.ok) router.refresh();
    } catch {
      // ignore
    } finally {
      setCanceling(false);
      setCancelConfirm(false);
    }
  };

  const planLabel = plan === "business" ? "Business" : plan === "pro" ? "Pro" : plan === "starter" ? "Starter" : plan === "personal" ? "Starter" : "Free";
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("ja-JP") : null;
  const isAdmin = role === "admin";
  const isPaid = isAdmin || plan === "starter" || plan === "personal" || plan === "pro" || plan === "business";

  // Credit purchase view
  if (showCredit) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text-primary)", paddingBottom: 100 }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
          <button onClick={() => setShowCredit(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
            戻る
          </button>
          <p style={sectionLabel}>クレジット購入</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            クレジット追加
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 28px" }}>
            残高: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{credits} cr</span>
            <span style={{ fontSize: 11, color: "var(--text-disabled)", marginLeft: 8 }}>(配布 {distributedCredits} + 購入 {purchasedCredits})</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CREDIT_PLANS.map((p) => (
              <div key={p.id} style={{ background: p.popular ? "var(--surface-raised)" : "var(--surface)", border: `1px solid ${p.popular ? "var(--btn-bg)" : "var(--border)"}`, borderRadius: 12, padding: "20px", position: "relative" }}>
                {p.popular && <span style={{ position: "absolute", top: -10, left: 16, fontSize: 11, color: "#fff", background: "var(--btn-bg)", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>おすすめ</span>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-display)", margin: 0 }}>{p.label} cr</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-display)", margin: 0 }}>{p.price}</p>
                </div>
                <button onClick={() => handlePurchase(p.id)} disabled={purchasing === p.id} style={{ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: p.popular ? "var(--btn-bg)" : "var(--surface-raised)", color: p.popular ? "#fff" : "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: purchasing === p.id ? "default" : "pointer", fontFamily: "inherit", opacity: purchasing === p.id ? 0.5 : 1 }}>
                  {purchasing === p.id ? "..." : "購入する"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }


  if (showPlans) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text-primary)", paddingBottom: 100 }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
          <button onClick={() => setShowPlans(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "8px 0", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
            戻る
          </button>
          <p style={sectionLabel}>プラン</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-display)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            プランを選ぶ
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>
            AIエージェントが、あなたの代わりに働きます
          </p>

          {/* Yearly/Monthly toggle */}
          <div style={{ display: "flex", background: "var(--surface)", borderRadius: 12, padding: 4, marginBottom: 20 }}>
            <button onClick={() => setIsYearly(false)} style={{ flex: 1, padding: "10px 0", background: !isYearly ? "var(--border)" : "transparent", color: !isYearly ? "#fff" : "var(--text-secondary)", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              月額
            </button>
            <button onClick={() => setIsYearly(true)} style={{ flex: 1, padding: "10px 0", background: isYearly ? "var(--border)" : "transparent", color: isYearly ? "#fff" : "var(--text-secondary)", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", position: "relative" }}>
              年額
              <span style={{ position: "absolute", top: -8, right: 12, background: "#22c55e", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>2ヶ月無料</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SUB_PLANS.filter((p) => p.id !== "business").map((p) => {
              const isCurrent = plan === p.id || (plan === "personal" && p.id === "starter");
              const isPro = p.id === "pro";
              const monthlyEquiv = isYearly && p.yearlyPrice > 0 ? Math.round(p.yearlyPrice / 12) : p.price;
              const savings = isYearly && p.price > 0 ? p.price * 12 - p.yearlyPrice : 0;
              const costPerRun = p.price > 0 ? Math.round(monthlyEquiv / p.runs) : 0;

              return (
                <div key={p.id} style={{
                  background: isPro ? "var(--surface)" : "var(--surface)",
                  border: `${isPro ? "2px" : "1px"} solid ${isPro ? "var(--btn-bg)" : "var(--border)"}`,
                  borderRadius: 16, padding: "20px", position: "relative",
                }}>
                  {p.badge && (
                    <span style={{ position: "absolute", top: -10, right: 16, background: "linear-gradient(135deg, var(--btn-bg), #5b5fd6)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 8 }}>
                      {p.badge}
                    </span>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px" }}>{p.label}</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text-display)" }}>
                          {p.price === 0 ? "¥0" : `¥${monthlyEquiv.toLocaleString()}`}
                        </span>
                        {p.price > 0 && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>/月</span>}
                      </div>
                      {isYearly && savings > 0 && (
                        <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, margin: "2px 0 0" }}>
                          年間 ¥{savings.toLocaleString()} お得
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", background: "var(--bg)", padding: "8px 12px", borderRadius: 10 }}>
                      <p style={{ fontSize: 22, fontWeight: 700, color: "var(--btn-bg)", margin: 0 }}>{p.runs.toLocaleString()}</p>
                      <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>回/月</p>
                    </div>
                  </div>

                  {/* Cost per run bar */}
                  {p.price > 0 && (
                    <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>1回あたり</span>
                      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${Math.max(10, Math.min(100, 100 - costPerRun * 2))}%`, background: "linear-gradient(90deg, #22c55e, var(--btn-bg))", borderRadius: 2, transition: "width 0.5s ease" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>¥{costPerRun}</span>
                    </div>
                  )}

                  {/* Features */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
                    {p.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: f.ok ? "var(--text-primary)" : "var(--text-disabled)" }}>
                        {f.ok ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="var(--btn-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4L10 10M10 4L4 10" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        )}
                        <span style={{ textDecoration: f.ok ? "none" : "line-through", opacity: f.ok ? 1 : 0.5 }}>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => !isCurrent && handlePurchase(isYearly ? p.id + "_yearly" : p.id)}
                    disabled={isCurrent || purchasing === p.id}
                    style={{
                      width: "100%", padding: "12px", borderRadius: 10, border: "none",
                      background: isCurrent ? "var(--surface-raised)" : isPro ? "linear-gradient(135deg, var(--btn-bg), #5b5fd6)" : "var(--surface)",
                      color: isCurrent ? "var(--text-secondary)" : "#fff",
                      fontSize: 14, fontWeight: 600, cursor: isCurrent ? "default" : "pointer",
                      fontFamily: "inherit", opacity: purchasing === p.id ? 0.5 : 1,
                      ...((!isCurrent && !isPro) ? { border: "1px solid var(--border)" } : {}),
                    }}
                  >
                    {isCurrent ? "現在のプラン" : purchasing === p.id ? "..." : p.price === 0 ? "現在のプラン" : `${p.label}を始める`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison with other AI services */}
          <div style={{ marginTop: 20, padding: "16px", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px" }}>他のAIサービスとの比較</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12 }}>
              <div>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 2px" }}>ChatGPT Plus</p>
                <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-secondary)", margin: 0 }}>¥3,000</p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 2px" }}>Claude Pro</p>
                <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-secondary)", margin: 0 }}>¥3,000</p>
              </div>
              <div>
                <p style={{ color: "var(--btn-bg)", margin: "0 0 2px" }}>Lattice Pro</p>
                <p style={{ fontWeight: 700, fontSize: 16, color: "var(--btn-bg)", margin: 0 }}>¥2,480</p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#22c55e", marginTop: 8, fontWeight: 600 }}>しかもLatticeは自動で動き続ける</p>
          </div>
        </div>
      </main>
    );
  }

  // Main settings view
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text-primary)", paddingBottom: 80 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
        <p style={sectionLabel}>設定</p>

        {errorParam === "upgrade" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--warning)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--warning)", margin: 0 }}>外部連携にはパーソナルプラン以上が必要です</p>
          </div>
        )}

        {success === "credits" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--success)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--success)", margin: 0 }}>クレジットを購入しました</p>
          </div>
        )}
        {success === "subscription" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--success)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--success)", margin: 0 }}>プランをアップグレードしました！</p>
          </div>
        )}

        {/* Account */}
        <div style={cardStyle}>
          <p style={sectionLabel}>アカウント</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {image ? (
              <img src={image} alt={name} width={44} height={44} style={{ borderRadius: "50%", border: "1px solid var(--border)" }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><circle cx="10" cy="7" r="4" /><path d="M3 18c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" /></svg>
              </div>
            )}
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>{name || "ユーザー"}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{email}</p>
            </div>
          </div>
        </div>
        {profileSection}

        {/* Plan */}
        <div style={cardStyle}>
          <p style={sectionLabel}>プラン</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-display)" }}>{planLabel}</span>
            {isPaid && <span style={{ fontSize: 11, color: "var(--success)", background: "var(--surface)", padding: "3px 10px", borderRadius: 20 }}>有効</span>}
          </div>
          {periodEnd && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 14px" }}>次回請求日: {periodEnd}</p>}
          {!isPaid && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 14px" }}>月15回の自動実行・エージェント3体まで</p>}
          <button onClick={() => setShowPlans(true)} style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--btn-bg)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{isPaid ? "プラン変更" : "アップグレード"}</span>
            <span style={{ fontSize: 16 }}>...</span>
          </button>
        </div>

        {/* Credits */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ ...sectionLabel, margin: 0 }}>クレジット</p>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{credits}</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 12px" }}>配布 {distributedCredits} cr + 購入 {purchasedCredits} cr</p>
          <button onClick={() => setShowCredit(true)} style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--btn-bg)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>クレジットを追加</span>
            <span style={{ fontSize: 16 }}>...</span>
          </button>
        </div>

        {/* Connections */}
        <div style={cardStyle}>
          <p style={sectionLabel}>サービス連携</p>
          {connections.length > 0 && (
            <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {connections.map(c => {
                const meta = JSON.parse(c.metadata || "{}");
                const label = c.provider === "discord" ? `Discord - ${meta.guildName || "サーバー"}` : c.provider === "gmail" ? `Gmail - ${meta.email || ""}` : c.provider;
                return (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", borderRadius: 8, padding: "10px 14px" }}>
                    <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
                    <button onClick={() => handleDisconnect(c.id)} disabled={disconnecting === c.id} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      {disconnecting === c.id ? "..." : "解除"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!connections.find(c => c.provider === "gmail") && (
              <a href="/api/connections/gmail" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border)", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12z" fill="#EA4335"/><rect x="2" y="4" width="20" height="16" rx="2" stroke="#EA4335" strokeWidth="1.5" fill="none"/></svg>
                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{isPaid ? "Gmailを連携する" : "Gmail連携 (要アップグレード)"}</span>
              </a>
            )}
            {!connections.find(c => c.provider === "discord") && (
              <a href="/api/connections/discord" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border)", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.44.87-.61 1.26a18.27 18.27 0 00-5.49 0 12.64 12.64 0 00-.62-1.26.08.08 0 00-.08-.04 19.74 19.74 0 00-4.89 1.52.07.07 0 00-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 00.03.06 19.9 19.9 0 005.99 3.03.08.08 0 00.08-.03c.46-.63.87-1.3 1.22-2a.08.08 0 00-.04-.11 13.1 13.1 0 01-1.87-.9.08.08 0 01-.01-.13c.13-.09.25-.19.37-.29a.08.08 0 01.08-.01c3.93 1.79 8.18 1.79 12.07 0a.08.08 0 01.08.01c.12.1.25.2.37.29a.08.08 0 01-.01.13c-.6.35-1.22.65-1.87.9a.08.08 0 00-.04.11c.36.7.77 1.37 1.22 2a.08.08 0 00.08.03 19.83 19.83 0 006-3.03.08.08 0 00.03-.06c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 00-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/></svg>
                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{isPaid ? "Discordを連携する" : "Discord連携 (要アップグレード)"}</span>
              </a>
            )}
          </div>
          {(plan === "business" || isAdmin) && !connections.find(c => c.provider === "line") && (
            <div style={{ marginTop: 14, padding: "16px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755"><path d="M12 2C6.48 2 2 5.64 2 10.14c0 4.05 3.6 7.44 8.46 8.08.33.07.78.22.89.5.1.26.07.66.03.92l-.14.87c-.04.26-.2 1.03.9.56s5.97-3.52 8.15-6.02C22.14 13.07 22 11.63 22 10.14 22 5.64 17.52 2 12 2z"/></svg>
                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>LINE連携</span>
              </div>
              <a href="https://lin.ee/P0E0l9c" target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: 8, background: "#06C755", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 10 }}>1. Lattice Bot を友だち追加</a>
              {!lineCode ? (
                <button onClick={handleLineGenerate} disabled={lineConnecting} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>{lineConnecting ? "..." : "2. 連携コードを発行"}</button>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px" }}>このコードをLINEで送信（10分有効）</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.15em", margin: "0 0 8px" }}>{lineCode}</p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Lattice Bot のトークに入力してください</p>
                </div>
              )}
              {lineSuccess && <p style={{ fontSize: 12, color: "var(--success)", margin: "8px 0 0", textAlign: "center" }}>LINE連携が完了しました</p>}
            </div>
          )}
          {plan !== "business" && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755"><path d="M12 2C6.48 2 2 5.64 2 10.14c0 4.05 3.6 7.44 8.46 8.08.33.07.78.22.89.5.1.26.07.66.03.92l-.14.87c-.04.26-.2 1.03.9.56s5.97-3.52 8.15-6.02C22.14 13.07 22 11.63 22 10.14 22 5.64 17.52 2 12 2z"/></svg>
              <span style={{ fontSize: 14, color: "var(--text-primary)" }}>LINE連携 (要ビジネスプラン)</span>
            </div>
          )}
        </div>

        {/* Lattice News & About - card buttons */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setSubView("news")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Lattice ニュース</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>新機能・アップデート情報</p>
            </div>
            <span style={{ fontSize: 16, color: "var(--text-disabled)" }}>&rsaquo;</span>
          </button>
          <button onClick={() => setSubView("about")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Lattice の性能について</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>できること・できないこと</p>
            </div>
            <span style={{ fontSize: 16, color: "var(--text-disabled)" }}>&rsaquo;</span>
          </button>
        </div>

        {/* News Sub View */}
        {subView === "news" && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg)", zIndex: 100, overflowY: "auto", paddingBottom: 80 }}>
            <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 16px" }}>
              {newsDetail === null && (<button onClick={() => { setSubView(null); setNewsDetail(null); }} style={{ background: "none", border: "none", color: "var(--btn-bg)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, padding: 0 }}>&#8592; 戻る</button>)}
              {newsDetail === null ? (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 20px" }}>Lattice ニュース</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                       { id: 4, title: "Tool Useの自律実行機能を追加しました", date: "2026/3/31" },
                       { id: 5, title: "AI記憶 / AI学習機能を追加しました", date: "2026/3/31" },
                       { id: 6, title: "エージェント編集・次回実行表示を改善しました", date: "2026/3/31" },
                      { id: 1, title: "LINE連携機能を追加しました", date: "2026/3/29" },
                      { id: 2, title: "サブスクリプション機能を追加しました", date: "2026/3/28" },
                      { id: 3, title: "テンプレートストアを追加しました", date: "2026/3/28" },
                    ].map(item => (
                      <button key={item.id} onClick={() => setNewsDetail(item.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontFamily: "inherit" }}>
                        <div style={{ textAlign: "left" }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{item.title}</p>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{item.date}</p>
                        </div>
                        <span style={{ fontSize: 16, color: "var(--text-disabled)" }}>&rsaquo;</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setNewsDetail(null)} style={{ background: "none", border: "none", color: "var(--btn-bg)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 12, padding: 0 }}>&#8592; 一覧に戻る</button>
                  {newsDetail === 1 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>LINE連携機能を追加しました</h3>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 16px" }}>2026/3/29</p>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8 }}>Businessプランのユーザーは、エージェントの実行結果をLINEで受け取れるようになりました。設定画面のサービス連携からLINE Botを友だち追加して、6桁の連携コードを送信するだけで設定できます。</p>
                    </div>
                  )}
                  {newsDetail === 2 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>サブスクリプション機能を追加しました</h3>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 16px" }}>2026/3/28</p>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8 }}>Personal（¥980/月）とBusiness（¥4,980/月）プランが利用可能になりました。有料プランではクレジット追加購入、Gmail/Discord連携、無制限エージェント作成が使えます。</p>
                    </div>
                  )}
                  {newsDetail === 3 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>テンプレートストアを追加しました</h3>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 16px" }}>2026/3/28</p>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8 }}>ストアからテンプレートを選んで、設定項目を入力するだけでエージェントを即作成できるようになりました。AIニュース要約、競合サイト監視、天気予報など8種類のテンプレートを用意しています。</p>
                    </div>
                  )}
                  {newsDetail === 4 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>Tool Useの自律実行機能を追加しました</h3>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 16px" }}>2026/3/31</p>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8 }}>エージェントがWebページの取得やGmail送信を自分で判断して実行するTool Use機能を追加しました。Pro/Businessプランで利用可能です。</p>
                    </div>
                  )}
                  {newsDetail === 5 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>AI記憶 / AI学習機能を追加しました</h3>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 16px" }}>2026/3/31</p>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8 }}>エージェントが過去の実行結果を覚えて、次回の出力を改善するAI記憶機能を実装しました。直近5件の成功ログを参照し、同じ内容の繰り返しを避け変化点を強調します。Pro/Business限定。</p>
                    </div>
                  )}
                  {newsDetail === 6 && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>エージェント編集・次回実行表示を改善しました</h3>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 16px" }}>2026/3/31</p>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8 }}>エージェントの詳細画面から名前や説明を直接編集できるようになりました。また、次回実行日時が「今日」「明日」「4/2」など正確に表示されるようになりました。</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* About Sub View */}
        {subView === "about" && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg)", zIndex: 100, overflowY: "auto", paddingBottom: 80 }}>
            <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 16px" }}>
              <button onClick={() => setSubView(null)} style={{ background: "none", border: "none", color: "var(--btn-bg)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, padding: 0 }}>&#8592; 戻る</button>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 20px" }}>Lattice の性能について</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: "18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 10px" }}>できること</p>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8, margin: 0 }}>
                    ・Web上の最新情報を検索して要約・分析<br/>
                    ・スケジュール実行（毎日・毎週など）で定期自動実行<br/>
                    ・結果をアプリ内・Gmail・Discord・LINEに自動送信<br/>
                    ・日本語の自然文から自動でエージェントを設定
                  </p>
                </div>
                <div style={{ padding: "18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 10px" }}>現在できないこと</p>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8, margin: 0 }}>
                    ・SNSのリアルタイム監視（API未連携のため）<br/>
                    ・ファイルのアップロード・処理<br/>
                    ・リアルタイムの即時通知（スケジュール実行ベース）<br/>
                    ・100%正確な情報の保証（AI生成のため誤りの可能性あり）
                  </p>
                </div>
                <div style={{ padding: "18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 10px" }}>開発者より</p>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8, margin: 0 }}>Latticeは現在ベータ版です。費用が貯まり次第、順次機能を追加していくのでよろしくお願いします。ご要望やバグ報告は X（@Lattice_Node）までお気軽にどうぞ。</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Links */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <a href="/privacy/" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "var(--text-primary)" }}>プライバシーポリシー</span>
            <span style={{ fontSize: 14, color: "var(--text-disabled)" }}>&rarr;</span>
          </a>
          <a href="/terms/" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "var(--text-primary)" }}>利用規約</span>
            <span style={{ fontSize: 14, color: "var(--text-disabled)" }}>&rarr;</span>
          </a>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-disabled)", textAlign: "center", margin: "16px 0" }}>Lattice v0.1.0 beta</p>

        {/* テーマ切替 */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 2px", fontWeight: 500 }}>外観モード</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{theme === "dark" ? "ダーク" : "ライト"}</p>
          </div>
          <button onClick={toggleTheme} className={`toggle ${theme === "dark" ? "on" : "off"}`}>
            <div className="toggle-knob" />
          </button>
        </div>

        <button onClick={() => handleSignOut()} style={{ width: "100%", padding: "13px", borderRadius: 999, border: "1px solid var(--border-visible)", background: "transparent", color: "var(--accent)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
          ログアウト
        </button>

        <button onClick={handleDelete} disabled={deleting} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: confirm ? "var(--accent)" : "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          {deleting ? "削除中..." : confirm ? "もう一度タップで確定" : "アカウントを削除"}
        </button>
      </div>
    </main>
  );
}
