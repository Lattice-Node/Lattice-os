"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import NodeClient from "./NodeClient";

export default function NodePage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/node")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const json = await res.json();
        setNodes(json.nodes ?? []);
      })
      .catch((e) => console.error("[node] fetch failed", e))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !nodes) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return <NodeClient nodes={nodes} />;
}
