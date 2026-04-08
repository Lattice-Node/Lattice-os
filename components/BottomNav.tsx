"use client";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { hapticImpact } from "@/lib/native";
import { nativeFetch } from "@/lib/native-fetch";

const tabs = [
  { href: "/home/", label: "ホーム", icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.4"><path d="M3 9l7-6 7 6"/><path d="M5 8v8a1 1 0 001 1h8a1 1 0 001-1V8"/></svg> },
  { href: "/node/", label: "ノード", icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.3"><circle cx="10" cy="10" r="6"/><circle cx="10" cy="10" r="2"/><line x1="10" y1="4" x2="10" y2="6"/><line x1="10" y1="14" x2="10" y2="16"/><line x1="4" y1="10" x2="6" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/></svg> },
  { href: "/agents/new/", label: "作成", isCenter: true, icon: (_a: boolean) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2"><path d="M10 4v12M4 10h12"/></svg> },
  { href: "/inbox/", label: "受信箱", icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.3"><path d="M3 5h14M3 10h14M3 15h9"/></svg> },
  { href: "/settings/", label: "設定", icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.3"><circle cx="10" cy="7" r="3.5"/><path d="M4 17c0-3 2.5-5 6-5s6 2 6 5"/></svg> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if ((pathname === "/store/" || pathname === "/node/") && status === "authenticated") {
      nativeFetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "store_visit" }) }).catch(() => {});
    }
  }, [pathname, status]);

  const hiddenPaths = ["/login/", "/privacy/", "/terms/", "/pricing/"];
  if (hiddenPaths.includes(pathname)) return null;
  if (pathname.match(/^\/node\/[^/]+\/(chat|talk)$/)) return null;

  const go = (href: string) => {
    hapticImpact("light");
    router.push(href);
  };

  const itemBtnStyle: React.CSSProperties = {
    flex: 1,
    minHeight: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    background: "none",
    border: "none",
    padding: "6px 0",
    cursor: "pointer",
    fontFamily: "inherit",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <nav className="btm-nav">
      {tabs.map(tab => {
        const active = tab.href === "/home/" ? pathname === "/home/" : tab.href === "/agents/new/" ? pathname === "/agents/new/" : pathname.startsWith(tab.href);
        if (tab.isCenter) return (
          <button key={tab.href} type="button" onClick={() => go(tab.href)} style={{ ...itemBtnStyle, marginTop: -14 }}>
            <div className="btm-nav-center-btn">{tab.icon(true)}</div>
            <span className="btm-nav-label" style={{ color: "var(--nav-inactive)" }}>{tab.label}</span>
          </button>
        );
        return (
          <button key={tab.href} type="button" onClick={() => go(tab.href)} style={itemBtnStyle}>
            {active && <div style={{ width: 4, height: 4, background: "var(--accent)", borderRadius: "50%" }} />}
            {tab.icon(active)}
            <span className="btm-nav-label" style={{ color: active ? "var(--nav-active)" : "var(--nav-inactive)" }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
