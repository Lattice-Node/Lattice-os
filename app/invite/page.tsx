"use client";

import { useEffect, useState } from "react";
import { nativeFetch } from "@/lib/native-fetch";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";

interface InviteData {
  inviteCode: string;
  inviteUrl: string;
  invitees: { name: string; joinedAt: string }[];
  totalInvited: number;
  creditsEarned: number;
}

export default function InvitePage() {
  const [data, setData] = useState<InviteData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    nativeFetch("/api/invite")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  const copyLink = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareOnX = () => {
    if (!data) return;
    const text = encodeURIComponent(
      `Lattice で AI エージェントを自動化してる！招待リンクから登録するとクレジットがもらえるよ 🎁\n\n${data.inviteUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  if (!data) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return (
    <main style={{ minHeight: "100%", paddingBottom: 20, background: "var(--bg)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "20px 20px 0" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>INVITE</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-display)", margin: "0 0 20px", letterSpacing: "-0.02em" }}>友達を招待</h1>

        {/* Reward card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", borderRadius: 16, padding: 20, marginBottom: 20 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>🎁</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>招待で両方に +10 クレジット</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>友達がエージェントを1回実行で付与</p>
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <code style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.9)", wordBreak: "break-all", fontFamily: "'Space Mono', monospace" }}>
              {data.inviteUrl}
            </code>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={copyLink}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                background: copied ? "#22c55e" : "rgba(255,255,255,0.15)", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {copied ? "コピー済み ✓" : "リンクをコピー"}
            </button>
            <button
              onClick={shareOnX}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                background: "#000", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              X でシェア
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px", fontFamily: "'Space Mono', monospace" }}>
              <CountUp to={data.totalInvited} />
            </p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>招待した人数</p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px", fontFamily: "'Space Mono', monospace" }}>
              <CountUp to={data.creditsEarned} />
            </p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>獲得クレジット</p>
          </div>
        </div>

        {/* Invitees list */}
        {data.invitees.length > 0 && (
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>招待した友達</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {data.invitees.map((u, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{u.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace" }}>
                    {new Date(u.joinedAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
