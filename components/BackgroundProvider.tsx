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

  // Apply theme ONLY on /apps, restore default elsewhere
  useEffect(() => {
    const isApps = pathname === "/apps" || pathname === "/apps/";

    if (!isApps) {
      document.documentElement.style.background = "";
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
    document.body.style.background = bg;
    document.body.style.backgroundAttachment = "fixed";

    return () => {
      document.documentElement.style.background = "";
      document.body.style.background = "";
      document.body.style.backgroundAttachment = "";
      document.body.setAttribute("data-route", "other");
    };
  }, [pathname, theme, customUrl]);

  return null;
}
