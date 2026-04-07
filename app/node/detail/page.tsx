"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import NodeDetailClient from "./NodeDetailClient";

function NodeDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.replace("/node/");
      return;
    }
    nativeFetch(`/api/node/${id}/details`)
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        if (res.status === 404) {
          router.replace("/node/");
          return;
        }
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        setData(await res.json());
      })
      .catch((e) => console.error("[node/detail] fetch failed", e))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !data) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return (
    <NodeDetailClient
      node={data.node}
      memoryCount={data.memoryCount}
      exchangeCount={data.exchangeCount}
      latestDiary={data.latestDiary}
      recentExchanges={data.recentExchanges}
    />
  );
}

export default function NodeDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>読み込み中...</div>}>
      <NodeDetailInner />
    </Suspense>
  );
}
