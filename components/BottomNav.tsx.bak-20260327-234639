"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/store",
    label: "ストア",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#6c71e8" : "#4a5060"} strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="12" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="12" width="7" height="7" rx="1.5" />
        <rect x="12" y="12" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/agents",
    label: "マイAgent",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#6c71e8" : "#4a5060"} strokeWidth="1.6">
        <circle cx="11" cy="11" r="8" />
        <path d="M11 7v4l3 2" />
      </svg>
    ),
  },
  {
    href: "/agents/new",
    label: "作成",
    isCenter: true,
    icon: (_active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M11 4v14M4 11h14" />
      </svg>
    ),
  },
  {
    href: "/logs",
    label: "ログ",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#6c71e8" : "#4a5060"} strokeWidth="1.6">
        <path d="M4 6h14M4 11h14M4 16h10" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "設定",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? "#6c71e8" : "#4a5060"} strokeWidth="1.6">
        <circle cx="11" cy="8" r="4" />
        <path d="M4 19c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") return null;

  return (
    <nav className="btm-nav">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/agents"
            ? pathname === "/agents"
            : tab.href === "/agents/new"
            ? pathname === "/agents/new"
            : pathname.startsWith(tab.href);

        if (tab.isCenter) {
          return (
            <Link key={tab.href} href={tab.href} className="btm-nav-center">
              <div className="btm-nav-center-btn">{tab.icon(true)}</div>
              <span className="btm-nav-label" style={{ color: "#4a5060" }}>{tab.label}</span>
            </Link>
          );
        }

        return (
          <Link key={tab.href} href={tab.href} className="btm-nav-item">
            {tab.icon(isActive)}
            <span className="btm-nav-label" style={{ color: isActive ? "#6c71e8" : "#4a5060" }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}