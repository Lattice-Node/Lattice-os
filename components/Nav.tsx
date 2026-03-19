"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useApp, colors } from "@/lib/theme";
import { translations } from "@/lib/i18n";

export default function Nav() {
  const { data: session } = useSession();
  const { theme, toggleTheme, lang, setLang } = useApp();
  const c = colors[theme];
  const t = translations[lang].nav;

  return (
    <nav style={{
      borderBottom: `1px solid ${c.border}`,
      padding: "14px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: c.bg,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: c.text }}>
        <span style={{ fontSize: 20, color: c.accent }}>◈</span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>Lattice</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Link href="/marketplace" style={{ fontSize: 13, color: c.textMuted, textDecoration: "none" }}>{t.marketplace}</Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: c.textMuted, textDecoration: "none" }}>{t.dashboard}</Link>
        <Link href="/publish" style={{ fontSize: 13, color: c.textMuted, textDecoration: "none" }}>{t.publish}</Link>

        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          style={{ background: "none", border: `1px solid ${c.border}`, color: c.textMuted, borderRadius: 6, fontSize: 12, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}
        >
          {lang === "ja" ? "EN" : "JA"}
        </button>

        <button
          onClick={toggleTheme}
          style={{ background: "none", border: `1px solid ${c.border}`, color: c.textMuted, borderRadius: 6, fontSize: 14, padding: "4px 10px", cursor: "pointer" }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {session ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={session.user?.image ?? ""} style={{ width: 28, height: 28, borderRadius: "50%" }} alt="avatar" />
            <button onClick={() => signOut()} style={{ background: "none", border: "none", color: c.textDim, fontSize: 12, cursor: "pointer" }}>
              {t.logout}
            </button>
          </div>
        ) : (
          <button onClick={() => signIn("github")} style={{ background: c.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {t.login}
          </button>
        )}
      </div>
    </nav>
  );
}
