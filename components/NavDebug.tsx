"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavDebug() {
  const pathname = usePathname();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const t = new Date().toISOString().slice(11, 19);
    setHistory((h) => [`${t} ${pathname}`, ...h].slice(0, 8));
  }, [pathname]);

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        right: 0,
        zIndex: 999998,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontSize: 8,
        fontFamily: "monospace",
        padding: "4px 6px",
        maxWidth: 200,
        pointerEvents: "none",
        textAlign: "right",
      }}
    >
      <div style={{ color: "#ff0" }}>NAV: {pathname}</div>
      {history.map((h, i) => (
        <div key={i} style={{ opacity: 1 - i * 0.1 }}>
          {h}
        </div>
      ))}
    </div>
  );
}
