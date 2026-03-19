"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import { useApp, colors } from "@/lib/theme";
import { translations } from "@/lib/i18n";

type Props = {
  stats: {
    agentCount: number;
    purchaseCount: number;
    totalUseCount: number;
  };
};

export default function HomeClient({ stats }: Props) {
  const { theme, lang } = useApp();
  const c = colors[theme];
  const t = translations[lang].home;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <Nav />

      {/* HERO */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: theme === "dark" ? "#4d9fff18" : "#2563eb10",
          border: `1px solid ${theme === "dark" ? "#4d9fff30" : "#2563eb20"}`,
          borderRadius: 100, padding: "6px 16px", fontSize: 13, color: c.accent, marginBottom: 32,
        }}>
          <span style={{ width: 7, height: 7, background: c.accent, borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
          {t.badge}
        </div>

        <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24, maxWidth: 800 }}>
          {t.title1}{" "}
          <span style={{ color: c.accent }}>{t.title2}</span>
        </h1>

        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: c.textMuted, maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
          {t.subtitle}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/marketplace" style={{
            background: c.accent, color: "#fff", textDecoration: "none",
            padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            transition: "opacity 0.15s",
          }}>
            {t.cta1}
          </Link>
          <Link href="/publish" style={{
            background: "transparent",
            color: c.text,
            textDecoration: "none",
            padding: "14px 28px",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            border: `1px solid ${c.border}`,
            transition: "border-color 0.15s",
          }}>
            {t.cta2}
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: t.stat1, value: stats.agentCount },
          { label: t.stat2, value: stats.purchaseCount },
          { label: t.stat3, value: stats.totalUseCount },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: 16,
            padding: "28px 24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: c.accent, letterSpacing: "-0.02em", marginBottom: 6 }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: c.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
