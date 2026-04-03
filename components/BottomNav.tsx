"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const tabs = [
  { href: "/home", label: "ホーム", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? "#6c71e8" : "#4a5060"} strokeWidth="1.6"><path d="M3 10l8-7 8 7"/><path d="M5 9v9a1 1 0 001 1h10a1 1 0 001-1V9"/></svg> },
  { href: "/store", label: "ストア", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? "#6c71e8" : "#4a5060"} strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5"/></svg> },
  { href: "/agents/new", label: "作成", isCenter: true, icon: (_a: boolean) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2"><path d="M11 4v14M4 11h14"/></svg> },
  { href: "/inbox", label: "受信箱", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? "#6c71e8" : "#4a5060"} strokeWidth="1.6"><path d="M4 6h14M4 11h14M4 16h10"/></svg> },
  { href: "/settings", label: "設定", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={a ? "#6c71e8" : "#4a5060"} strokeWidth="1.6"><circle cx="11" cy="8" r="4"/><path d="M4 19c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => { setLoading(false); }, [pathname]);

  // Track store visits for daily task
  useEffect(() => {
    if (pathname === "/store" && status === "authenticated") {
      fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "store_visit" }) }).catch(() => {});
    }
  }, [pathname, status]);

  const publicPaths = ["/", "/login", "/privacy", "/terms", "/pricing"];
  if (publicPaths.includes(pathname) || status !== "authenticated") return null;

  const click = (href: string) => {
    const cur = href === "/home" ? pathname === "/home" : href === "/agents/new" ? pathname === "/agents/new" : pathname.startsWith(href);
    if (!cur) setLoading(true);
  };

  return (
    <>
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(17,19,24,0.7)" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #2a2d35", borderTop: "3px solid #6c71e8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      <nav className="btm-nav">
        {tabs.map(tab => {
          const active = tab.href === "/home" ? pathname === "/home" : tab.href === "/agents/new" ? pathname === "/agents/new" : pathname.startsWith(tab.href);
          if (tab.isCenter) return (
            <Link key={tab.href} href={tab.href} className="btm-nav-center" onClick={() => click(tab.href)}>
              <div className="btm-nav-center-btn">{tab.icon(true)}</div>
              <span className="btm-nav-label" style={{ color: "#4a5060" }}>{tab.label}</span>
            </Link>
          );
          return (
            <Link key={tab.href} href={tab.href} className="btm-nav-item" onClick={() => click(tab.href)}>
              {tab.icon(active)}
              <span className="btm-nav-label" style={{ color: active ? "#6c71e8" : "#4a5060" }}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
