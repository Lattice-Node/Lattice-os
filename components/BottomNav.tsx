"use client";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { hapticImpact } from "@/lib/native";
import { nativeFetch } from "@/lib/native-fetch";

const tabs = [
  { href: "/home/", label: "ホーム", icon: (a: boolean) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.6"><path d="M4 11l8-7 8 7"/><path d="M6 9.5V19a1 1 0 001 1h10a1 1 0 001-1V9.5"/></svg> },
  { href: "/node/", label: "ノード", icon: (a: boolean) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.5"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="5" x2="12" y2="7.5"/><line x1="12" y1="16.5" x2="12" y2="19"/><line x1="5" y1="12" x2="7.5" y2="12"/><line x1="16.5" y1="12" x2="19" y2="12"/></svg> },
  { href: "/agents/new/", label: "作成", isCenter: true, icon: (_a: boolean) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> },
  { href: "/inbox/", label: "受信箱", icon: (a: boolean) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.5"><path d="M4 6h16M4 12h16M4 18h10"/></svg> },
  { href: "/settings/", label: "設定", icon: (a: boolean) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--nav-active)" : "var(--nav-inactive)"} strokeWidth="1.5"><circle cx="12" cy="8.5" r="4"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></svg> },
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

  // TEMPORARY: debug overlay showing actual computed dimensions
  useEffect(() => {
    if (typeof window === "undefined") return;
    const targets = [
      { name: "body", el: document.body },
      { name: ".app-shell", el: document.querySelector(".app-shell") },
      { name: ".btm-nav", el: document.querySelector(".btm-nav") },
    ];
    const lines: string[] = [];
    targets.forEach(({ name, el }) => {
      if (!el) { lines.push(`${name}: NOT FOUND`); return; }
      const cs = getComputedStyle(el as Element);
      const rect = (el as HTMLElement).getBoundingClientRect();
      lines.push(`${name}: pb=${cs.paddingBottom} h=${Math.round(rect.height)} btm=${Math.round(rect.bottom)}`);
    });
    lines.push(`vp: innerH=${window.innerHeight} screenH=${screen.height}`);
    const d = document.createElement("div");
    d.id = "__navdbg";
    d.style.cssText = "position:fixed;top:env(safe-area-inset-top,0px);left:0;right:0;background:red;color:#fff;font:9px/1.3 monospace;padding:4px 8px;z-index:99999;white-space:pre;pointer-events:none";
    d.textContent = lines.join("\n");
    document.getElementById("__navdbg")?.remove();
    document.body.appendChild(d);
    setTimeout(() => document.getElementById("__navdbg")?.remove(), 60000);
  }, []);

  const hiddenPaths = ["/login/", "/privacy/", "/terms/", "/pricing/"];
  if (hiddenPaths.includes(pathname)) return null;
  if (pathname.match(/^\/node\/[^/]+\/(chat|talk)$/)) return null;

  const go = (href: string) => {
    hapticImpact("light");
    router.push(href);
  };

  return (
    <nav className="btm-nav">
      {tabs.map(tab => {
        const active = tab.href === "/home/"
          ? pathname === "/home/"
          : tab.href === "/agents/new/"
            ? pathname === "/agents/new/"
            : pathname.startsWith(tab.href);
        return (
          <button
            key={tab.href}
            type="button"
            onClick={() => go(tab.href)}
            style={{
              flex: 1,
              height: 49,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            {(tab as any).isCenter ? (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.icon(active)}
              </div>
            ) : (
              tab.icon(active)
            )}
            <span className="btm-nav-label" style={{ color: active ? "var(--nav-active)" : "var(--nav-inactive)" }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
