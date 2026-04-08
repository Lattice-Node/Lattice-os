/**
 * Monetization gating — single source of truth for payment UI visibility.
 *
 * Phase 1 launch state:
 * - Web payment UI: hidden by default. Enable by setting NEXT_PUBLIC_WEB_PAYMENT_ENABLED=true on Vercel.
 * - iOS payment UI: hidden until RevenueCat IAP is wired. Will be enabled in Phase 2 by NEXT_PUBLIC_IOS_PAYMENT_ENABLED=true.
 * - Default behavior on a fresh deploy: NO payment UI visible anywhere.
 *
 * Why two flags?
 * - Web flag lets us re-enable Stripe testing in dev without exposing it on iOS.
 * - iOS flag is the kill switch for IAP if RevenueCat has issues post-launch.
 *
 * Apple guideline 3.1.1 compliance:
 * - When iOS flag is false, ALL payment UI must be unreachable from the iOS build.
 * - Server endpoints must also reject iOS-originated requests when the flag is off.
 */

export type Platform = "ios" | "android" | "web" | "unknown";

/**
 * Detect runtime platform on the client. Returns "unknown" during SSR.
 */
export function getClientPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const cap = (window as any).Capacitor;
  if (cap?.getPlatform) {
    const p = cap.getPlatform();
    if (p === "ios" || p === "android" || p === "web") return p;
  }
  // Fallback: not in Capacitor at all
  return "web";
}

/**
 * Web (browser) Stripe payment is enabled when the env flag is "true".
 * Default: false (no payment UI on Web until we explicitly enable).
 */
export function isWebPaymentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WEB_PAYMENT_ENABLED === "true";
}

/**
 * iOS in-app purchase is enabled when the env flag is "true".
 * Default: false (no IAP UI on iOS until RevenueCat is wired and tested).
 */
export function isIosPaymentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_IOS_PAYMENT_ENABLED === "true";
}

/**
 * Returns true if any payment UI should be visible on the current client.
 * Use this in React components to gate the entire plan/purchase UI.
 *
 * - On iOS: visible only when NEXT_PUBLIC_IOS_PAYMENT_ENABLED=true
 * - On Android: same as iOS (treat as native)
 * - On Web: visible only when NEXT_PUBLIC_WEB_PAYMENT_ENABLED=true
 * - During SSR (typeof window undefined): false (safe default)
 */
export function isPaymentUiVisible(): boolean {
  const platform = getClientPlatform();
  if (platform === "ios" || platform === "android") {
    return isIosPaymentEnabled();
  }
  if (platform === "web") {
    return isWebPaymentEnabled();
  }
  return false;
}

/**
 * Server-side platform detection from request headers.
 * Capacitor WebView sets User-Agent with "Capacitor" prefix on iOS.
 * Also accepts a custom X-Lattice-Platform header for explicit override.
 */
export function getServerPlatform(req: Request): Platform {
  const explicit = req.headers.get("x-lattice-platform");
  if (explicit === "ios" || explicit === "android" || explicit === "web") {
    return explicit;
  }
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  if (ua.includes("capacitor")) {
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "ios";
    if (ua.includes("android")) return "android";
    return "ios"; // assume iOS by default for native Capacitor builds
  }
  // Some Capacitor iOS builds use the system WebView UA without "Capacitor".
  // The Origin header capacitor://localhost is a more reliable signal.
  const origin = req.headers.get("origin") || "";
  if (origin.startsWith("capacitor://")) return "ios";
  return "web";
}

/**
 * Server-side check: should this request be allowed to hit a payment endpoint?
 * Returns { allowed: false, reason } when blocked.
 */
export function checkPaymentEndpointAllowed(req: Request): { allowed: true } | { allowed: false; reason: string } {
  const platform = getServerPlatform(req);
  if (platform === "ios" || platform === "android") {
    if (!isIosPaymentEnabled()) {
      return { allowed: false, reason: "iOS payment is disabled (NEXT_PUBLIC_IOS_PAYMENT_ENABLED=false). Use IAP via RevenueCat once enabled." };
    }
    // iOS flag enabled but Stripe endpoint should never be reached from iOS regardless
    return { allowed: false, reason: "Stripe checkout is not available on iOS. Use in-app purchase." };
  }
  if (!isWebPaymentEnabled()) {
    return { allowed: false, reason: "Web payment is disabled (NEXT_PUBLIC_WEB_PAYMENT_ENABLED=false)." };
  }
  return { allowed: true };
}
