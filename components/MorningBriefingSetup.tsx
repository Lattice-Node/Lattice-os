"use client";

import { useEffect } from "react";
import { isNativePlatform, scheduleLocalNotification, getPreference, setPreference } from "@/lib/native";

export default function MorningBriefingSetup() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    (async () => {
      const scheduled = await getPreference("morning_briefing_scheduled");
      if (scheduled === "true") return;

      // 毎朝8時のLocal Notification
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);

      await scheduleLocalNotification({
        id: 1001,
        title: "おはようございます",
        body: "Nodeが待っています。今日も話しかけてみませんか？",
        at: tomorrow,
        repeating: true,
      });

      await setPreference("morning_briefing_scheduled", "true");
    })();
  }, []);

  return null;
}
