"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: "/marketplace", label: "繝励Ο繝ｳ繝励ヨ" },
    { href: "/compare", label: "AI豈碑ｼ・ },
    { href: "/news", label: "繝九Η繝ｼ繧ｹ" },
    { href: "/blog", label: "繝悶Ο繧ｰ" },
    { href: "/work", label: "蜑ｯ讌ｭ" },
  ];

  const isAdmin = session?.user?.email &&
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").includes(session.user.email);

  return (
    <header style={{
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, background: "#6366f1",
            borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>L</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
            Lattice
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: "8px 14px", borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              textDecoration: "none",
              color: pathname === link.href ? "#6366f1" : "#4b5563",
              background: pathname === link.href ? "#ede9fe" : "transparent",
              transition: "all 0.15s"
            }}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{
              padding: "8px 14px", borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              textDecoration: "none", color: "#4b5563"
            }}>
              邂｡逅・
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {session ? (
            <>
              <Link href="/dashboard" style={{
                padding: "8px 16px", borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                textDecoration: "none", color: "#4b5563"
              }}>
                繝繝・す繝･繝懊・繝・
              </Link>
              <button onClick={() => signOut()} style={{
                padding: "8px 16px", borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                border: "1.5px solid #e5e7eb",
                background: "#fff", color: "#4b5563",
                cursor: "pointer"
              }}>
                繝ｭ繧ｰ繧｢繧ｦ繝・
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                padding: "8px 16px", borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                textDecoration: "none", color: "#4b5563"
              }}>
                繝ｭ繧ｰ繧､繝ｳ
              </Link>
              <Link href="/login" style={{
                padding: "9px 20px", borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                textDecoration: "none",
                background: "#6366f1", color: "#fff",
                boxShadow: "0 2px 8px rgba(99,102,241,0.3)"
              }}>
                辟｡譁吶〒蟋九ａ繧・
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}