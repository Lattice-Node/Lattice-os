export const API_BASE =
  typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.()
    ? "https://www.lattice-protocol.com"
    : "";

export const apiUrl = (path: string) => `${API_BASE}${path}`;
