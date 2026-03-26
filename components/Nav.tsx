"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: 56,
      borderBottom: "1px solid #1a1a1a",
      background: "rgba(10,10,10,0.95)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.3"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" }}>Lattice</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {session && (
            <Link href="/agents" style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              color: pathname?.startsWith("/agents") ? "#ffffff" : "#666666",
              background: pathname?.startsWith("/agents") ? "#161616" : "transparent",
              textDecoration: "none",
            }}>
              Agents
            </Link>
          )}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {session ? (
            <>
              <span style={{ fontSize: 13, color: "#3a3a3a" }}>{session.user?.email}</span>
              <button
                onClick={() => signOut()}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  border: "1px solid #222",
                  background: "transparent",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, color: "#666", textDecoration: "none" }}>
                Log in
              </Link>
              <Link href="/login" style={{ padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, background: "#5b5fc7", color: "#fff", textDecoration: "none" }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}