/**
 * Capacitor ネイティブ機能のユーティリティ
 * Web環境では全てno-opで動作する
 */

let _isNative: boolean | null = null;

export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  if (_isNative !== null) return _isNative;
  _isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  return _isNative;
}

// ── Haptic Feedback ──

// Cache the dynamic import so taps don't pay the import overhead repeatedly
let _hapticsPromise: Promise<any> | null = null;
function getHaptics() {
  if (!_hapticsPromise) {
    _hapticsPromise = import("@capacitor/haptics");
  }
  return _hapticsPromise;
}

export function hapticImpact(style: "light" | "medium" | "heavy" = "medium") {
  if (!isNativePlatform()) return;
  // Fire and forget — don't await, don't block the click handler
  getHaptics().then((m) => {
    const map = { light: m.ImpactStyle.Light, medium: m.ImpactStyle.Medium, heavy: m.ImpactStyle.Heavy };
    m.Haptics.impact({ style: map[style] }).catch(() => {});
  }).catch(() => {});
}

export function hapticNotification(type: "success" | "warning" | "error" = "success") {
  if (!isNativePlatform()) return;
  getHaptics().then((m) => {
    const map = { success: m.NotificationType.Success, warning: m.NotificationType.Warning, error: m.NotificationType.Error };
    m.Haptics.notification({ type: map[type] }).catch(() => {});
  }).catch(() => {});
}

export function hapticSelection() {
  if (!isNativePlatform()) return;
  getHaptics().then((m) => {
    m.Haptics.selectionStart().catch(() => {});
    m.Haptics.selectionChanged().catch(() => {});
    m.Haptics.selectionEnd().catch(() => {});
  }).catch(() => {});
}

// ── Native Share ──

export async function nativeShare(opts: { title?: string; text: string; url?: string }): Promise<boolean> {
  if (!isNativePlatform()) {
    if (navigator.share) {
      try { await navigator.share(opts); return true; } catch { return false; }
    }
    return false;
  }
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share(opts);
    return true;
  } catch {
    return false;
  }
}

// ── Network Status ──

export async function getNetworkStatus(): Promise<{ connected: boolean; type: string }> {
  if (!isNativePlatform()) {
    return { connected: navigator.onLine, type: "unknown" };
  }
  try {
    const { Network } = await import("@capacitor/network");
    const status = await Network.getStatus();
    return { connected: status.connected, type: status.connectionType };
  } catch {
    return { connected: navigator.onLine, type: "unknown" };
  }
}

export async function onNetworkChange(callback: (connected: boolean) => void): Promise<() => void> {
  if (!isNativePlatform()) {
    const on = () => callback(true);
    const off = () => callback(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }
  try {
    const { Network } = await import("@capacitor/network");
    const handle = await Network.addListener("networkStatusChange", (status) => {
      callback(status.connected);
    });
    return () => handle.remove();
  } catch {
    return () => {};
  }
}

// ── Preferences (ネイティブストレージ) ──

export async function setPreference(key: string, value: string) {
  if (!isNativePlatform()) {
    localStorage.setItem(key, value);
    return;
  }
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value });
  } catch {
    localStorage.setItem(key, value);
  }
}

export async function getPreference(key: string): Promise<string | null> {
  if (!isNativePlatform()) {
    return localStorage.getItem(key);
  }
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return localStorage.getItem(key);
  }
}

// ── Local Notifications ──

export async function scheduleLocalNotification(opts: {
  id: number;
  title: string;
  body: string;
  at: Date;
  repeating?: boolean;
}) {
  if (!isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perms = await LocalNotifications.checkPermissions();
    if (perms.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }
    await LocalNotifications.schedule({
      notifications: [{
        id: opts.id,
        title: opts.title,
        body: opts.body,
        schedule: {
          at: opts.at,
          repeats: opts.repeating ?? false,
          every: opts.repeating ? "day" : undefined,
        },
      }],
    });
  } catch {}
}

export async function cancelLocalNotification(id: number) {
  if (!isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch {}
}

// ── Camera ──

export async function takePhoto(): Promise<string | null> {
  if (!isNativePlatform()) return null;
  try {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const perms = await Camera.checkPermissions();
    if (perms.camera !== "granted" && perms.camera !== "limited") {
      const req = await Camera.requestPermissions({ permissions: ["camera"] });
      if (req.camera !== "granted" && req.camera !== "limited") return null;
    }
    const photo = await Camera.getPhoto({
      quality: 80,
      width: 400,
      height: 400,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });
    return photo.dataUrl ?? null;
  } catch {
    return null;
  }
}
