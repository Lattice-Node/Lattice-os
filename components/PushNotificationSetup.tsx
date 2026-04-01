"use client";
import { useEffect } from "react";

export default function PushNotificationSetup() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    async function setup() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;

        const { initializeApp, getApps } = await import("firebase/app");
        const { getMessaging, getToken } = await import("firebase/messaging");

        if (!getApps().length) {
          initializeApp({
            projectId: "lattice-os-68cd6",
            messagingSenderId: "374198713259",
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
          });
        }

        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: reg,
        });

        if (token) {
          await fetch("/api/push/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, platform: "web" }),
          });
        }
      } catch (e) {
        console.error("Push setup failed:", e);
      }
    }

    setup();
  }, []);

  return null;
}