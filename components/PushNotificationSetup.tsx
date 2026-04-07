"use client";
import { useEffect } from "react";

export default function PushNotificationSetup() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Capacitorネイティブ環境の場合
    async function setupNative() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return false;

        const { PushNotifications } = await import(
          "@capacitor/push-notifications"
        );

        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== "granted") return true;

        await PushNotifications.addListener("registration", async (token) => {
          console.log("[Push] Native token:", token.value);
          await fetch("/api/push/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: token.value,
              platform: Capacitor.getPlatform(),
            }),
          });
        });

        await PushNotifications.addListener("registrationError", (err) => {
          console.error("[Push] Registration error:", err.error);
        });

        await PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("[Push] Received:", notification);
          }
        );

        await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (notification) => {
            const agentId = notification.notification.data?.agentId;
            if (agentId) {
              window.location.href = `/agents/detail/?id=${agentId}`;
            }
          }
        );

        await PushNotifications.register();
        return true;
      } catch (e) {
        console.log("[Push] Not native environment:", e);
        return false;
      }
    }

    // Web環境の場合（既存のFirebase実装）
    async function setupWeb() {
      if (!("Notification" in window) || !("serviceWorker" in navigator))
        return;
      if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID || !process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
        console.warn("[Push] Firebase env not configured, skipping web push");
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
        const reg = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        await navigator.serviceWorker.ready;
        const { initializeApp, getApps } = await import("firebase/app");
        const { getMessaging, getToken } = await import("firebase/messaging");
        if (!getApps().length) {
          initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
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
        console.error("Web push setup failed:", e);
      }
    }

    // ネイティブ優先、ダメならWeb
    setupNative().then((isNative) => {
      if (!isNative) setupWeb();
    });
  }, []);
  return null;
}