"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();

  return (
    <nav style={{
      borderBottom: "1px solid #1c2136",
      padding: "14px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#080b14",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#e8eaf0" }}>
        <span style={{ fontSize: 20, color: "#3b82f6" }}>◈</span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "#e8eaf0" }}>Lattice</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/marketplace" style={{ fontSize: 13, color: "#8b92a9", textDecoration: "none" }}>プロンプト一覧</Link>
        <Link href="/blog" style={{ fontSize: 13, color: "#8b92a9", textDecoration: "none" }}>ブログ</Link>
        <Link href="/publish" style={{ fontSize: 13, color: "#8b92a9", textDecoration: "none" }}>出品する</Link>
        {session ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: "#8b92a9", textDecoration: "none" }}>ダッシュボード</Link>
            <img src={session.user?.image ?? ""} style={{ width: 28, height: 28, borderRadius: "50%" }} alt="avatar" />
            <button onClick={() => signOut()} style={{ background: "none", border: "none", color: "#4a5068", fontSize: 12, cursor: "pointer" }}>
              ログアウト
            </button>
          </div>
        ) : (
          <button onClick={() => signIn("github")} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ログイン
          </button>
        )}
      </div>
    </nav>
  );
}