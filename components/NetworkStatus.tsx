"use client";

import { useState, useEffect } from "react";
import { onNetworkChange, hapticNotification } from "@/lib/native";

export default function NetworkStatus() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    onNetworkChange((connected) => {
      setOffline(!connected);
      if (!connected) hapticNotification("warning");
      if (connected) hapticNotification("success");
    }).then((fn) => { cleanup = fn; });
    return () => cleanup?.();
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "env(safe-area-inset-top, 0px)",
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#ef4444",
        color: "#fff",
        textAlign: "center",
        padding: "6px 16px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      オフラインです。接続を確認してください。
    </div>
  );
}
