import { API_BASE } from "./api-base";

const isNative = (): boolean =>
  typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

async function getStoredToken(): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: "session_token" });
    return value;
  } catch {
    return null;
  }
}

export async function nativeFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);

  if (isNative()) {
    const token = await getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: isNative() ? "omit" : "include",
  });
}

export async function saveNativeSession(token: string): Promise<void> {
  if (!isNative()) return;
  const { Preferences } = await import("@capacitor/preferences");
  await Preferences.set({ key: "session_token", value: token });
}

export async function clearNativeSession(): Promise<void> {
  if (!isNative()) return;
  const { Preferences } = await import("@capacitor/preferences");
  await Preferences.remove({ key: "session_token" });
}
