import { API_BASE } from "./api-base";

const isNative = (): boolean =>
  typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

// Cache the dynamic import so subsequent calls don't pay the import overhead
let _preferencesPromise: Promise<any> | null = null;
function getPreferences() {
  if (!_preferencesPromise) {
    _preferencesPromise = import("@capacitor/preferences").then((m) => m.Preferences);
  }
  return _preferencesPromise;
}

// In-memory cache of the bearer token to avoid repeated Preferences reads
let _cachedToken: string | null | undefined = undefined;

async function getStoredToken(): Promise<string | null> {
  if (!isNative()) return null;
  if (_cachedToken !== undefined) return _cachedToken;
  try {
    const Preferences = await getPreferences();
    const { value } = await Preferences.get({ key: "session_token" });
    _cachedToken = value;
    return value;
  } catch {
    return null;
  }
}

export async function nativeFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE}${path}`;

  const doFetch = async (): Promise<Response> => {
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
  };

  let res = await doFetch();
  // Retry once after a short delay if 401 on native (handles Preferences/bridge init race)
  if (res.status === 401 && isNative()) {
    await new Promise((r) => setTimeout(r, 400));
    res = await doFetch();
  }
  return res;
}

export async function saveNativeSession(token: string): Promise<void> {
  if (!isNative()) return;
  const Preferences = await getPreferences();
  await Preferences.set({ key: "session_token", value: token });
  _cachedToken = token;
}

export async function clearNativeSession(): Promise<void> {
  if (!isNative()) return;
  const Preferences = await getPreferences();
  await Preferences.remove({ key: "session_token" });
  _cachedToken = null;
}
