"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import HomeClient from "./HomeClient";

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbg, setDbg] = useState<string>("init");

  useEffect(() => {
    let cancelled = false;
    setDbg("useEffect started");
    const hardTimeout = setTimeout(() => {
      if (!cancelled) {
        setDbg((d) => d + " | TIMEOUT");
        setData({ isLoggedIn: false });
        setLoading(false);
      }
    }, 8000);
    (async () => {
      try {
        setDbg("fetching /api/home");
        const res = await nativeFetch("/api/home");
        setDbg(`fetch -> ${res.status}`);
        if (cancelled) return;
        if (!res.ok) {
          setData({ isLoggedIn: false });
          return;
        }
        let json: any = null;
        try {
          json = await res.json();
          setDbg(`json ok, isLoggedIn=${json?.isLoggedIn}`);
        } catch (e) {
          setDbg(`json parse fail: ${e instanceof Error ? e.message : String(e)}`);
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
        setDbg(`fetch ERROR: ${e instanceof Error ? e.message : String(e)}`);
        if (!cancelled) setData({ isLoggedIn: false });
      } finally {
        clearTimeout(hardTimeout);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: 20, color: "var(--text-secondary)" }}>
        読み込み中...
        <div style={{ marginTop: 12, fontSize: 10, color: "#666", fontFamily: "monospace" }}>
          DBG: {dbg}
        </div>
      </div>
    );
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
