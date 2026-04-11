"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import { BACKGROUND_THEMES } from "@/lib/backgrounds";

export default function BackgroundProvider() {
  const [theme, setTheme] = useState("dark");
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const pathname = usePathname();

  // Configure StatusBar overlay once on mount (iOS)
  useEffect(() => {
    (async () => {
      try {
        const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
        if (!isNative) return;
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#00000000" });
      } catch {}
    })();
  }, []);

  // Fetch user's theme once
  useEffect(() => {
    if (fetched) return;
    nativeFetch("/api/user/background")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.theme) setTheme(d.theme);
        if (d?.customUrl) setCustomUrl(d.customUrl);
        setFetched(true);
      })
      .catch(() => setFetched(true));
  }, [fetched]);

  // Listen for theme changes from Settings
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.theme) setTheme(detail.theme);
      if (detail?.customUrl !== undefined) setCustomUrl(detail.customUrl);
    };
    window.addEventListener("lattice-theme-changed", handler);
    return () => window.removeEventListener("lattice-theme-changed", handler);
  }, []);

  // Apply theme ONLY on /apps, restore default elsewhere
  useEffect(() => {
    const isApps = pathname === "/apps" || pathname === "/apps/";

    if (!isApps) {
      document.documentElement.style.background = "";
      document.documentElement.style.backgroundAttachment = "";
      document.body.style.background = "";
      document.body.style.backgroundAttachment = "";
      document.body.setAttribute("data-route", "other");
      return;
    }

    document.body.setAttribute("data-route", "apps");

    const themeObj = BACKGROUND_THEMES.find((t) => t.id === theme);
    if (!themeObj) return;

    const bg =
      theme === "custom" && customUrl
        ? `url(${customUrl}) center/cover no-repeat fixed`
        : themeObj.full || "#0a0a0a";

    document.documentElement.style.background = bg;
    document.documentElement.style.backgroundAttachment = "fixed";
    document.body.style.background = bg;
    document.body.style.backgroundAttachment = "fixed";

    return () => {
      document.documentElement.style.background = "";
      document.documentElement.style.backgroundAttachment = "";
      document.body.style.background = "";
      document.body.style.backgroundAttachment = "";
      document.body.setAttribute("data-route", "other");
    };
  }, [pathname, theme, customUrl]);

  return null;
}
