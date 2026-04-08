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
    let cancelled = false;
    (async () => {
      try {
        const res = await nativeFetch("/api/home");
        if (cancelled) return;
        if (!res.ok) {
          setData({ isLoggedIn: false });
          return;
        }
        let json: any = null;
        try {
          json = await res.json();
        } catch (e) {
          console.error("[home] json parse failed", e);
          setData({ isLoggedIn: false });
          return;
        }
        if (cancelled) return;
        setData(json || { isLoggedIn: false });

        if (json?.isLoggedIn) {
          try {
            const stateRes = await nativeFetch("/api/onboarding/state");
            if (stateRes.ok) {
              const state = await stateRes.json();
              if (!state?.onboardingCompleted) {
                router.replace("/onboarding/");
              }
            }
          } catch (e) {
            console.warn("[home] onboarding state check failed", e);
          }
        }
      } catch (e) {
        console.error("[home] fetch failed", e);
        if (!cancelled) setData({ isLoggedIn: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !data) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  try {
    return (
      <HomeClient
        name={data?.name ?? ""}
        avatarUrl={data?.avatarUrl ?? null}
        credits={typeof data?.credits === "number" ? data.credits : 0}
        plan={data?.plan ?? "free"}
        agentCount={typeof data?.agentCount === "number" ? data.agentCount : 0}
        isLoggedIn={!!data?.isLoggedIn}
      />
    );
  } catch (e) {
    console.error("[home] render failed", e);
    return (
      <div style={{ padding: 20, color: "var(--text-secondary)" }}>
        読み込みエラー: {e instanceof Error ? e.message : String(e)}
      </div>
    );
  }
}
