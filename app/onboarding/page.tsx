"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import OnboardingClient from "./OnboardingClient";

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    nativeFetch("/api/onboarding/state")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        if (!res.ok) {
          setReady(true);
          return;
        }
        const json = await res.json();
        if (json.onboardingCompleted) {
          router.replace("/home/");
          return;
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [router]);

  if (!ready) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return <OnboardingClient />;
}
