"use client";
import { useEffect } from "react";

export default function NativeBodyClass() {
  useEffect(() => {
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      document.documentElement.classList.add("native");
      document.body.classList.add("native");
    }
  }, []);
  return null;
}
