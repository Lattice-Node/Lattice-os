"use client";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Props {
  name: string;
  email: string;
  image: string;
  credits: number;
  plan: string;
  currentPeriodEnd: string | null;
}

const CREDIT_PLANS = [
  { id: "credits_100", label: "100", price: "500", priceNum: 500, perUnit: "50", desc: "" },
  { id: "credits_500", label: "500", price: "2,000", priceNum: 2000, perUnit: "250", desc: "", popular: true },
  { id: "credits_1000", label: "1,000", price: "3,500", priceNum: 3500, perUnit: "500", desc: "" },
];

const SUB_PLANS = [
  { id: "free", label: "フリー", price: "0", features: ["月30クレジット (15回実行)", "エージェント3体まで", "スケジュール実行", "アプリ内出力のみ"] },
  { id: "personal", label: "パーソナル", price: "980", features: ["月300クレジット (150回実行)", "エージェント無制限", "Gmail / Discord 連携", "スケジュール実行"] },
  { id: "business", label: "ビジネス", price: "4,980", features: ["月1,500クレジット (750回実行)", "エージェント無制限", "全連携 (LINE含む)", "優先サポート"] },
];

const cardStyle = { background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, padding: "20px", marginBottom: 12 };
const sectionLabel = { fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase" as const, margin: "0 0 14px" };

export default function SettingsClient({ name, email, image, credits, plan, currentPeriodEnd }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showCredit, setShowCredit] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [connections, setConnections] = useState<{id:string,provider:string,metadata:string}[]>([]);
  const [disconnecting, setDisconnecting] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/connections").then(r => r.json()).then(d => setConnections(d.connections || [])).catch(() => {});
  }, []);

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      await fetch("/api/connections", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId: id }) });
      setConnections(c => c.filter(x => x.id !== id));
    } catch {} finally { setDisconnecting(null); }
  };

  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setPurchasing(null); }
  };

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/users/delete", { method: "DELETE" });
      if (res.ok) await signOut({ callbackUrl: "/" });
    } catch { setDeleting(false); setConfirm(false); }
  };

  const planLabel = plan === "business" ? "ビジネス" : plan === "personal" ? "パーソナル" : "フリー";
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("ja-JP") : null;
  const isPaid = plan === "personal" || plan === "business";

  // Credit purchase view
  if (showCredit) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0e1117", color: "#e8eaf0", paddingBottom: 100 }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
          <button onClick={() => setShowCredit(false)} style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0, marginBottom: 28 }}>
            back
          </button>
          <p style={sectionLabel}>credit purchase</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f2f8", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Add credits
          </h1>
          <p style={{ fontSize: 13, color: "#6a7080", margin: "0 0 28px" }}>
            Balance: <span style={{ color: "#e8eaf0", fontWeight: 600 }}>{credits} cr</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CREDIT_PLANS.map((p) => (
              <div key={p.id} style={{ background: p.popular ? "#14163a" : "#1c2028", border: `1px solid ${p.popular ? "#6c71e8" : "#2e3440"}`, borderRadius: 12, padding: "20px", position: "relative" }}>
                {p.popular && <span style={{ position: "absolute", top: -10, left: 16, fontSize: 11, color: "#fff", background: "#6c71e8", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>Popular</span>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#f0f2f8", margin: 0 }}>{p.label} cr</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "#f0f2f8", margin: 0 }}>{p.price}</p>
                </div>
                <button onClick={() => handlePurchase(p.id)} disabled={purchasing === p.id} style={{ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: p.popular ? "#6c71e8" : "#242830", color: p.popular ? "#fff" : "#9096a8", fontSize: 14, fontWeight: 600, cursor: purchasing === p.id ? "default" : "pointer", fontFamily: "inherit", opacity: purchasing === p.id ? 0.5 : 1 }}>
                  {purchasing === p.id ? "..." : "購入する"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Plan selection view
  if (showPlans) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0e1117", color: "#e8eaf0", paddingBottom: 100 }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
          <button onClick={() => setShowPlans(false)} style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0, marginBottom: 28 }}>
            back
          </button>
          <p style={sectionLabel}>プラン</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f2f8", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            プランをアップグレード
          </h1>
          <p style={{ fontSize: 13, color: "#6a7080", margin: "0 0 28px" }}>
            現在のプラン: <span style={{ color: "#e8eaf0", fontWeight: 600 }}>{planLabel}</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SUB_PLANS.map((p) => {
              const isCurrent = plan === p.id;
              return (
                <div key={p.id} style={{ background: p.id === "business" ? "#14163a" : "#1c2028", border: `1px solid ${p.id === "business" ? "#6c71e8" : "#2e3440"}`, borderRadius: 16, padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8", margin: 0 }}>{p.label}</h2>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: "#f0f2f8" }}>{p.price}</span>
                      <span style={{ fontSize: 13, color: "#6a7080" }}> /mo</span>
                    </div>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px" }}>
                    {p.features.map((f, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#9096a8", padding: "5px 0", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#6c71e8", fontSize: 14 }}>+</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => !isCurrent && handlePurchase(p.id)} disabled={isCurrent || purchasing === p.id} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: isCurrent ? "#242830" : "#6c71e8", color: isCurrent ? "#6a7080" : "#fff", fontSize: 14, fontWeight: 600, cursor: isCurrent ? "default" : "pointer", fontFamily: "inherit", opacity: purchasing === p.id ? 0.5 : 1 }}>
                    {isCurrent ? "現在のプラン" : purchasing === p.id ? "..." : "アップグレード"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // Main settings view
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0e1117", color: "#e8eaf0", paddingBottom: 100 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
        <p style={sectionLabel}>設定</p>

        {success === "credits" && (
          <div style={{ background: "#0f2a1a", border: "1px solid #1a4a2a", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "#4ade80", margin: 0 }}>クレジットを購入しました</p>
          </div>
        )}
        {success === "subscription" && (
          <div style={{ background: "#0f2a1a", border: "1px solid #1a4a2a", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "#4ade80", margin: 0 }}>プランをアップグレードしました！</p>
          </div>
        )}

        {/* Account */}
        <div style={cardStyle}>
          <p style={sectionLabel}>アカウント</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {image ? (
              <img src={image} alt={name} width={44} height={44} style={{ borderRadius: "50%", border: "1px solid #2e3440" }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2e3440", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#6a7080" strokeWidth="1.5"><circle cx="10" cy="7" r="4" /><path d="M3 18c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" /></svg>
              </div>
            )}
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#e8eaf0", margin: "0 0 3px" }}>{name || "ユーザー"}</p>
              <p style={{ fontSize: 13, color: "#6a7080", margin: 0 }}>{email}</p>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div style={cardStyle}>
          <p style={sectionLabel}>プラン</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f8" }}>{planLabel}</span>
            {isPaid && <span style={{ fontSize: 11, color: "#4ade80", background: "#0f2a1a", padding: "3px 10px", borderRadius: 20 }}>Active</span>}
          </div>
          {periodEnd && <p style={{ fontSize: 12, color: "#6a7080", margin: "4px 0 14px" }}>Next billing: {periodEnd}</p>}
          {!isPaid && <p style={{ fontSize: 12, color: "#6a7080", margin: "4px 0 14px" }}>30 cr / month - 3 agents</p>}
          <button onClick={() => setShowPlans(true)} style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "1px solid #2e3440", background: "transparent", color: "#6c71e8", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{isPaid ? "プラン変更" : "アップグレード"}</span>
            <span style={{ fontSize: 16 }}>...</span>
          </button>
        </div>

        {/* Credits */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ ...sectionLabel, margin: 0 }}>クレジット</p>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#e8eaf0", letterSpacing: "-0.02em" }}>{credits}</span>
          </div>
          {isPaid && (
            <button onClick={() => setShowCredit(true)} style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "1px solid #2e3440", background: "transparent", color: "#6c71e8", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Add credits</span>
              <span style={{ fontSize: 16 }}>...</span>
            </button>
          )}
          {!isPaid && (
            <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>有料プランでクレジット追加購入が可能です</p>
          )}
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
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0e1117", borderRadius: 8, padding: "10px 14px" }}>
                    <span style={{ fontSize: 13, color: "#c0c4d0" }}>{label}</span>
                    <button onClick={() => handleDisconnect(c.id)} disabled={disconnecting === c.id} style={{ background: "none", border: "none", color: "#f87171", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      {disconnecting === c.id ? "..." : "解除"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!connections.find(c => c.provider === "gmail") && (
              <a href="/api/connections/gmail" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid #2e3440", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12z" fill="#EA4335"/><rect x="2" y="4" width="20" height="16" rx="2" stroke="#EA4335" strokeWidth="1.5" fill="none"/></svg>
                <span style={{ fontSize: 14, color: "#c0c4d0" }}>Gmailを連携する</span>
              </a>
            )}
            {!connections.find(c => c.provider === "discord") && (
              <a href="/api/connections/discord" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid #2e3440", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.44.87-.61 1.26a18.27 18.27 0 00-5.49 0 12.64 12.64 0 00-.62-1.26.08.08 0 00-.08-.04 19.74 19.74 0 00-4.89 1.52.07.07 0 00-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 00.03.06 19.9 19.9 0 005.99 3.03.08.08 0 00.08-.03c.46-.63.87-1.3 1.22-2a.08.08 0 00-.04-.11 13.1 13.1 0 01-1.87-.9.08.08 0 01-.01-.13c.13-.09.25-.19.37-.29a.08.08 0 01.08-.01c3.93 1.79 8.18 1.79 12.07 0a.08.08 0 01.08.01c.12.1.25.2.37.29a.08.08 0 01-.01.13c-.6.35-1.22.65-1.87.9a.08.08 0 00-.04.11c.36.7.77 1.37 1.22 2a.08.08 0 00.08.03 19.83 19.83 0 006-3.03.08.08 0 00.03-.06c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 00-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/></svg>
                <span style={{ fontSize: 14, color: "#c0c4d0" }}>Discordを連携する</span>
              </a>
            )}
          </div>
        </div>

        {/* Links */}
        <div style={{ background: "#1c2028", border: "1px solid #2e3440", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <a href="/privacy" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #2e3440", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "#c0c4d0" }}>プライバシーポリシー</span>
            <span style={{ fontSize: 14, color: "#4a5060" }}>&rarr;</span>
          </a>
          <a href="/terms" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "#c0c4d0" }}>利用規約</span>
            <span style={{ fontSize: 14, color: "#4a5060" }}>&rarr;</span>
          </a>
        </div>

        <p style={{ fontSize: 12, color: "#4a5060", textAlign: "center", margin: "16px 0" }}>Lattice v0.1.0 beta</p>

        <button onClick={() => signOut({ callbackUrl: "/" })} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid #2e3440", background: "transparent", color: "#f87171", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
          ログアウト
        </button>

        <button onClick={handleDelete} disabled={deleting} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid #3a1a1a", background: "transparent", color: confirm ? "#f87171" : "#6a7080", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          {deleting ? "削除中..." : confirm ? "もう一度タップで確定" : "アカウントを削除"}
        </button>
      </div>
    </main>
  );
}