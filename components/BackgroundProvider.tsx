"use client";

import { useEffect, useState } from "react";
import { nativeFetch } from "@/lib/native-fetch";
import { BACKGROUND_THEMES } from "@/lib/backgrounds";

export default function BackgroundProvider() {
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (applied) return;
    nativeFetch("/api/user/background")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const theme = BACKGROUND_THEMES.find((t) => t.id === d.theme);
        if (!theme) return;

        let bg = theme.full;
        if (d.theme === "custom" && d.customUrl) {
          bg = `url(${d.customUrl}) center/cover no-repeat fixed`;
        }
        if (!bg) bg = "#0a0a0a";

        document.documentElement.style.background = bg;
        document.documentElement.style.backgroundAttachment = "fixed";
        document.body.style.background = bg;
        document.body.style.backgroundAttachment = "fixed";
        setApplied(true);
      })
      .catch(() => {});
  }, [applied]);

  return null;
}
