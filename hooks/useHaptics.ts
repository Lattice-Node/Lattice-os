/**
 * Haptic feedback hook. Silent no-op on web.
 * Apple HIG: light=taps, medium=mode changes, success=completed, error=failures.
 */
import { useCallback } from "react";

type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

let _hapticsModule: any = null;

async function getHapticsModule() {
  if (_hapticsModule) return _hapticsModule;
  try {
    _hapticsModule = await import("@capacitor/haptics");
  } catch {
    _hapticsModule = null;
  }
  return _hapticsModule;
}

function isNative(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
}

export function useHaptics() {
  const trigger = useCallback((type: HapticType = "light") => {
    if (!isNative()) return;
    getHapticsModule().then((mod) => {
      if (!mod) return;
      const { Haptics, ImpactStyle, NotificationType } = mod;
      switch (type) {
        case "light":
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
          break;
        case "medium":
          Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
          break;
        case "heavy":
          Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
          break;
        case "success":
          Haptics.notification({ type: NotificationType.Success }).catch(() => {});
          break;
        case "warning":
          Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
          break;
        case "error":
          Haptics.notification({ type: NotificationType.Error }).catch(() => {});
          break;
        case "selection":
          Haptics.selectionStart().catch(() => {});
          break;
      }
    }).catch(() => {});
  }, []);

  return { trigger };
}
