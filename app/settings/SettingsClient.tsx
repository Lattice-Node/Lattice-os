"use client";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Props {
  name: string;
  email: string;
  image: string;
  credits: number;
}

const CREDIT_PLANS = [
  { id: "credits_100", label: "100クレジット", price: "¥500", priceNum: 500, perUnit: "50回分の実行", desc: "お試し・少量追加に" },
  { id: "credits_500", label: "500クレジット", price: "¥2,000", priceNum: 2000, perUnit: "250回分の実行", desc: "月々の利用に", popular: true },
  { id: "credits_1000", label: "1,000クレジット", price: "¥3,500", priceNum: 3500, perUnit: "500回分の実行", desc: "ヘビーユーザー向け" },
];

export default function SettingsClient({ name, email, image, credits }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showCredit, setShowCredit] = useState(false);
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
    } catch {
      setPurchasing(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/users/delete", { method: "DELETE" });
      if (res.ok) await signOut({ callbackUrl: "/" });
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  };

  // クレジット購入画面
  if (showCredit) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#111318", color: "#e8eaf0", paddingBottom: 100 }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
          <button
            onClick={() => setShowCredit(false)}
            style={{ background: "none", border: "none", color: "#4a5060", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0, marginBottom: 28, display: "block" }}
          >
            ← 戻る
          </button>

          <p style={{ fontSize: 12, color: "#6a7080", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
            クレジット購入
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f2f8", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            クレジットを追加する
          </h1>
          <p style={{ fontSize: 13, color: "#6a7080", margin: "0 0 28px" }}>
            現在の残高：<span style={{ color: "#e8eaf0", fontWeight: 600 }}>{credits} クレジット</span>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CREDIT_PLANS.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: plan.popular ? "#14163a" : "#1a1d24",
                  border: `1px solid ${plan.popular ? "#6c71e8" : "#2a2d35"}`,
                  borderRadius: 12,
                  padding: "20px",
                  position: "relative",
                }}
              >
                {plan.popular && (
                  <span style={{ position: "absolute", top: -10, left: 16, fontSize: 11, color: "#fff", background: "#6c71e8", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>
                    人気
                  </span>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#f0f2f8", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
                      {plan.label}
                    </p>
                    <p style={{ fontSize: 12, color: "#6a7080", margin: 0 }}>{plan.desc}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "#f0f2f8", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                      {plan.price}
                    </p>
                    <p style={{ fontSize: 11, color: "#4a5060", margin: 0 }}>{plan.perUnit}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 8,
                    border: "none",
                    background: plan.popular ? "#6c71e8" : "#22252f",
                    color: plan.popular ? "#fff" : "#9096a8",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: purchasing === plan.id ? "default" : "pointer",
                    fontFamily: "inherit",
                    opacity: purchasing === plan.id ? 0.5 : 1,
                  }}
                >
                  {purchasing === plan.id ? "処理中..." : "購入する"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // 通常の設定画面
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#111318", color: "#e8eaf0", paddingBottom: 100 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
        <p style={{ fontSize: 12, color: "#6a7080", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 20px" }}>
          設定
        </p>

        {success && (
          <div style={{ background: "#0f2a1a", border: "1px solid #1a4a2a", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "#4ade80", margin: 0 }}>クレジットを購入しました</p>
          </div>
        )}

        {/* アカウント */}
        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, padding: "20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>アカウント</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {image ? (
              <img src={image} alt={name} width={44} height={44} style={{ borderRadius: "50%", border: "1px solid #2a2d35" }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2a2d35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#6a7080" strokeWidth="1.5">
                  <circle cx="10" cy="7" r="4" />
                  <path d="M3 18c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
                </svg>
              </div>
            )}
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#e8eaf0", margin: "0 0 3px", letterSpacing: "-0.01em" }}>{name || "ユーザー"}</p>
              <p style={{ fontSize: 13, color: "#6a7080", margin: 0 }}>{email}</p>
            </div>
          </div>
        </div>

        {/* クレジット */}
        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, padding: "20px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>クレジット</p>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#e8eaf0", letterSpacing: "-0.02em" }}>{credits}</span>
          </div>
          <button
            onClick={() => setShowCredit(true)}
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: 8,
              border: "1px solid #2a2d35",
              background: "transparent",
              color: "#6c71e8",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>クレジットを追加する</span>
            <span style={{ fontSize: 16 }}>›</span>
          </button>
        </div>


        {/* サービス連携 */}
        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, padding: "20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#6a7080", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>サービス連携</p>

          {connections.length > 0 && (
            <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {connections.map(c => {
                const meta = JSON.parse(c.metadata || "{}");
                const label = c.provider === "discord" ? `Discord - ${meta.guildName || "サーバー"}` : c.provider === "gmail" ? `Gmail - ${meta.email || ""}` : c.provider;
                return (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111318", borderRadius: 8, padding: "10px 14px" }}>
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
              <a href="/api/connections/gmail" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid #2a2d35", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12z" fill="#EA4335"/><rect x="2" y="4" width="20" height="16" rx="2" stroke="#EA4335" strokeWidth="1.5" fill="none"/></svg>
                <span style={{ fontSize: 14, color: "#c0c4d0" }}>Gmail を連携する</span>
              </a>
            )}
            {!connections.find(c => c.provider === "discord") && (
              <a href="/api/connections/discord" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid #2a2d35", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.44.87-.61 1.26a18.27 18.27 0 00-5.49 0 12.64 12.64 0 00-.62-1.26.08.08 0 00-.08-.04 19.74 19.74 0 00-4.89 1.52.07.07 0 00-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 00.03.06 19.9 19.9 0 005.99 3.03.08.08 0 00.08-.03c.46-.63.87-1.3 1.22-2a.08.08 0 00-.04-.11 13.1 13.1 0 01-1.87-.9.08.08 0 01-.01-.13c.13-.09.25-.19.37-.29a.08.08 0 01.08-.01c3.93 1.79 8.18 1.79 12.07 0a.08.08 0 01.08.01c.12.1.25.2.37.29a.08.08 0 01-.01.13c-.6.35-1.22.65-1.87.9a.08.08 0 00-.04.11c.36.7.77 1.37 1.22 2a.08.08 0 00.08.03 19.83 19.83 0 006-3.03.08.08 0 00.03-.06c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 00-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/></svg>
                <span style={{ fontSize: 14, color: "#c0c4d0" }}>Discord を連携する</span>
              </a>
            )}
          </div>
        </div>

        {/* リンク */}
        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <a href="/privacy" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #2a2d35", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "#c0c4d0" }}>プライバシーポリシー</span>
            <span style={{ fontSize: 14, color: "#4a5060" }}>→</span>
          </a>
          <a href="/terms" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "#c0c4d0" }}>利用規約</span>
            <span style={{ fontSize: 14, color: "#4a5060" }}>→</span>
          </a>
        </div>

        <p style={{ fontSize: 12, color: "#4a5060", textAlign: "center", margin: "16px 0" }}>Lattice v0.1.0 beta</p>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid #2a2d35", background: "transparent", color: "#f87171", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}
        >
          ログアウト
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid #3a1a1a", background: "transparent", color: confirm ? "#f87171" : "#6a7080", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
        >
          {deleting ? "削除中..." : confirm ? "本当に削除しますか？もう一度タップで確定" : "アカウントを削除"}
        </button>
      </div>
    </main>
  );
}
