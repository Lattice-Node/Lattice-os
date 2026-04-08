"use client";

import { useEffect } from "react";
import { initRevenueCat } from "@/lib/revenuecat";
import { nativeFetch } from "@/lib/native-fetch";

/**
 * Bootstraps RevenueCat once a user session is detected.
 * - Only runs on iOS Capacitor builds
 * - Only runs when NEXT_PUBLIC_IOS_PAYMENT_ENABLED=true (gated inside initRevenueCat)
 * - Fetches /api/home to learn the user ID, then configures Purchases with it as appUserID
 * - Idempotent: initRevenueCat itself short-circuits if already configured
 */
export default function RevenueCatBoot() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cap = (window as any).Capacitor;
    if (cap?.getPlatform?.() !== "ios") return;
    if (process.env.NEXT_PUBLIC_IOS_PAYMENT_ENABLED !== "true") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await nativeFetch("/api/home");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.isLoggedIn && data?.userId) {
          await initRevenueCat(data.userId);
        }
      } catch (e) {
        console.warn("[RevenueCatBoot] init failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
