"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import HomeClient from "./HomeClient";

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/home")
      .then(async (res) => {
        if (!res.ok) {
          setData({ isLoggedIn: false });
          return;
        }
        const json = await res.json();
        setData(json);

        // Onboarding check (replaces middleware behavior)
        if (json.isLoggedIn) {
          const stateRes = await nativeFetch("/api/onboarding/state");
          if (stateRes.ok) {
            const state = await stateRes.json();
            if (!state.onboardingCompleted) {
              router.replace("/onboarding/");
            }
          }
        }
      })
      .catch((e) => {
        console.error("[home] fetch failed", e);
        setData({ isLoggedIn: false });
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return (
    <HomeClient
      name={data.name ?? ""}
      avatarUrl={data.avatarUrl ?? null}
      credits={data.credits ?? 0}
      plan={data.plan ?? "free"}
      agentCount={data.agentCount ?? 0}
      isLoggedIn={data.isLoggedIn ?? false}
    />
  );
}
