"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import NewAgentClient from "./NewAgentClient";

function NewAgentInner() {
  const router = useRouter();
  const [data, setData] = useState<{ isPaid: boolean; connectedProviders: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/agents/templates")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        setData(await res.json());
      })
      .catch((e) => console.error("[agents/new] fetch failed", e))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) {
    return <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }} />;
  }

  return <NewAgentClient isPaid={data.isPaid} connectedProviders={data.connectedProviders} />;
}

export default function NewAgentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }} />}>
      <NewAgentInner />
    </Suspense>
  );
}
