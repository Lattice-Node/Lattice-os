"use client";

import { signOut } from "next-auth/react";

interface Props {
  name: string;
  email: string;
  image: string;
}

export default function SettingsClient({ name, email, image }: Props) {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#111318", color: "#e8eaf0", paddingBottom: 100 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 24px" }}>

        <p style={{ fontSize: 12, color: "#4a5060", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 20px" }}>
          設定
        </p>

        {/* Profile */}
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

        {/* Plan */}
        <div style={{ background: "#1a1d24", border: "1px solid #2a2d35", borderRadius: 12, padding: "20px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#4a5060", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>プラン</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#e8eaf0", margin: "0 0 3px" }}>Free</p>
              <p style={{ fontSize: 13, color: "#6a7080", margin: 0 }}>100クレジット / エージェント2個まで</p>
            </div>
            <span style={{ fontSize: 11, color: "#6c71e8", background: "#1e2044", padding: "4px 10px", borderRadius: 6, fontWeight: 500 }}>
              現在のプラン
            </span>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #2a2d35" }}>
            <a href="/login" style={{
              display: "block", textAlign: "center", padding: "10px",
              borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: "#6c71e8", color: "#fff", textDecoration: "none"
            }}>
              アップグレード
            </a>
          </div>
        </div>

        {/* Links */}
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

        {/* Version */}
        <p style={{ fontSize: 12, color: "#2a2d35", textAlign: "center", margin: "16px 0" }}>Lattice v0.1.0 beta</p>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            width: "100%", padding: "13px", borderRadius: 10,
            border: "1px solid #2a2d35", background: "transparent",
            color: "#f87171", fontSize: 14, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          ログアウト
        </button>

      </div>
    </main>
  );
}