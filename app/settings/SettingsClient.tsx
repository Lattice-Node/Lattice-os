"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface Props {
  name: string;
  email: string;
  image: string;
  credits: number;
}

const CREDIT_PLANS = [
  { id: "credits_100", label: "100クレジット", price: "500円" },
  { id: "credits_500", label: "500クレジット", price: "2,000円" },
  { id: "credits_1000", label: "1,000クレジット", price: "3,500円" },
];

export default function SettingsClient({ name, email, image, credits }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
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

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#111318", color: "#e8eaf0", paddingBottom: 100 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>
        <p style={{ fontSize: 12, color: "#4a5060", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 20px" }}>
          設定
        </p>

        {success && (
          <div style={{ background: "#0f2a1a", border: "1px solid #1a4a2a", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "#4ade80", margin: 0 }}>クレジットを購入しました</p>
          </div>
        )}

        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, padding: "20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>アカウント</p>
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

        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, padding: "20px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>クレジット</p>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#e8eaf0" }}>{credits}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CREDIT_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePurchase(plan.id)}
                disabled={purchasing === plan.id}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, border: "1px solid #2a2d35", background: purchasing === plan.id ? "#1e2044" : "transparent", color: "#e8eaf0", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                <span>{plan.label}</span>
                <span style={{ color: "#6c71e8", fontWeight: 600 }}>{plan.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <a href="/privacy" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #2a2d35", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "#9096a8" }}>プライバシーポリシー</span>
            <span style={{ fontSize: 14, color: "#4a5060" }}>→</span>
          </a>
          <a href="/terms" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "#9096a8" }}>利用規約</span>
            <span style={{ fontSize: 14, color: "#4a5060" }}>→</span>
          </a>
        </div>

        <p style={{ fontSize: 12, color: "#2a2d35", textAlign: "center", margin: "16px 0" }}>Lattice v0.1.0 beta</p>

        <button onClick={() => signOut({ callbackUrl: "/" })} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid #2a2d35", background: "transparent", color: "#f87171", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
          ログアウト
        </button>

        <button onClick={handleDelete} disabled={deleting} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid #3a1a1a", background: "transparent", color: confirm ? "#f87171" : "#4a5060", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          {deleting ? "削除中..." : confirm ? "本当に削除しますか？もう一度タップで確定" : "アカウントを削除"}
        </button>
      </div>
    </main>
  );
}
