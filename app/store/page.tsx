"use client";

import { useEffect, useState } from "react";
import { nativeFetch } from "@/lib/native-fetch";
import StoreList from "./StoreList";
import Link from "next/link";

export default function StorePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/store/data")
      .then(async (res) => {
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        setData(await res.json());
      })
      .catch((e) => console.error("[store] fetch failed", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return (
    <div className="page">
      {!data.isLoggedIn && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #2e3440" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, background: "#6c71e8", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>Lattice</span>
          </Link>
          <Link href="/login/" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#6c71e8", color: "#fff", textDecoration: "none" }}>
            ログイン
          </Link>
        </div>
      )}

      <p className="page-label">エージェントストア</p>
      <h1 className="page-title">エージェントを探す</h1>
      <StoreList
        templates={data.templates}
        isPaid={data.isPaid}
        userPlan={data.userPlan}
        connectedProviders={data.connectedProviders}
        communityAgents={data.communityAgents}
        isLoggedIn={data.isLoggedIn}
      />
    </div>
  );
}
