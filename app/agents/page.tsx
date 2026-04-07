"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import AgentsList from "./AgentsList";

export default function AgentsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ credits: number; agents: any[]; todayRuns: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/agents/list")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const json = await res.json();
        setData(json);
      })
      .catch((e) => console.error("[agents] fetch failed", e))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return (
    <div className="page">
      <p className="page-label">マイエージェント</p>
      <h1 className="page-title">マイエージェント</h1>

      <div className="stat-row">
        <div className="stat-box animate-in">
          <p className="stat-number" style={{ color: "var(--accent)" }}>
            {data.agents.filter((a: any) => a.active).length}
          </p>
          <p className="stat-label">稼働中</p>
        </div>
        <div className="stat-box animate-in">
          <p className="stat-number" style={{ color: "var(--green)" }}>{data.credits}</p>
          <p className="stat-label">残りクレジット</p>
        </div>
        <div className="stat-box animate-in">
          <p className="stat-number">{data.todayRuns}</p>
          <p className="stat-label">今日の実行</p>
        </div>
      </div>

      <AgentsList agents={data.agents} />
    </div>
  );
}
