/**
 * RevenueCat client wrapper.
 *
 * Real implementation. The SDK is statically imported so TypeScript types are
 * available everywhere. Runtime calls are gated by isEnabled() which checks
 * platform === 'ios' and NEXT_PUBLIC_IOS_PAYMENT_ENABLED.
 *
 * On Web or non-iOS platforms, all functions return null/[] without invoking
 * the native bridge.
 */

// Dynamic imports only — @capacitor/core and @revenuecat/purchases-capacitor are
// browser-only modules that must NOT be statically imported at module level.
// Static import would break Next.js SSR/static export.

type PurchasesOffering = any;
type PurchasesPackage = any;
type CustomerInfo = any;

const isEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  if (!cap?.getPlatform || cap.getPlatform() !== "ios") return false;
  return process.env.NEXT_PUBLIC_IOS_PAYMENT_ENABLED === "true";
};

async function getPurchases() {
  const mod = await import("@revenuecat/purchases-capacitor");
  return mod.Purchases;
}

let initialized = false;

/**
 * Initialize RevenueCat with the user's app user ID.
 * Call this once after login (and on app launch when a session exists).
 */
export async function initRevenueCat(userId: string): Promise<void> {
  if (!isEnabled()) return;
  if (initialized) return;

  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY_IOS;
  if (!apiKey) {
    console.warn("[revenuecat] API key not set");
    return;
  }

  // Wrap entire init in 8s timeout — dynamic import OR configure can hang
  // if the native plugin isn't properly linked
  const initWork = async () => {
    console.log("[revenuecat] importing SDK...");
    const Purchases = await getPurchases();
    console.log("[revenuecat] SDK imported. Calling configure...");
    await Purchases.configure({ apiKey, appUserID: userId });
    initialized = true;
    console.log("[revenuecat] initialized for user", userId);
  };

  try {
    const timeout = new Promise<"timeout">((r) => setTimeout(() => r("timeout"), 8000));
    const result = await Promise.race([initWork(), timeout]);
    if (result === "timeout") {
      console.error("[revenuecat] init TIMED OUT after 8s — SDK import or configure hung. Native plugin may not be linked.");
    }
  } catch (e) {
    console.error("[revenuecat] init failed", e);
  }
}

/**
 * Fetch the current offering (collection of purchasable packages).
 * Returns null when IAP is disabled or fetch fails.
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isEnabled()) return null;
  try {
    const Purchases = await getPurchases();
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.error("[revenuecat] getOfferings failed", e);
    return null;
  }
}

/**
 * Initiate an IAP purchase. Returns the new CustomerInfo on success,
 * null when the user cancelled, or throws on a real error.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  if (!isEnabled()) {
    throw new Error("IAP not enabled");
  }
  try {
    const Purchases = await getPurchases();
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    return result.customerInfo;
  } catch (e: any) {
    if (e?.userCancelled || e?.code === "PURCHASE_CANCELLED") {
      console.log("[revenuecat] purchase cancelled by user");
      return null;
    }
    console.error("[revenuecat] purchase failed", e);
    throw e;
  }
}

/**
 * Restore previous purchases. Required by Apple Guideline 3.1.1.
 * Returns the CustomerInfo or null on failure / when disabled.
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isEnabled()) return null;
  try {
    const Purchases = await getPurchases();
    const result = await Purchases.restorePurchases();
    return result.customerInfo;
  } catch (e) {
    console.error("[revenuecat] restore failed", e);
    return null;
  }
}

/**
 * Get the user's currently-active entitlement IDs (e.g. ["pro"]).
 * Returns empty array when IAP is disabled or fetch fails.
 */
export async function getActiveEntitlements(): Promise<string[]> {
  if (!isEnabled()) return [];
  try {
    const Purchases = await getPurchases();
    const result = await Purchases.getCustomerInfo();
    return Object.keys(result.customerInfo.entitlements.active);
  } catch (e) {
    console.error("[revenuecat] getActiveEntitlements failed", e);
    return [];
  }
}

/**
 * Map an Apple product ID to a Lattice plan name.
 * Mirror of the server-side mapping in /api/revenuecat/webhook/route.ts.
 */
export function productIdToPlan(productId: string | undefined | null): "starter" | "pro" | "business" | null {
  if (!productId) return null;
  if (productId === process.env.NEXT_PUBLIC_APPLE_PRODUCT_STARTER) return "starter";
  if (productId === process.env.NEXT_PUBLIC_APPLE_PRODUCT_PRO) return "pro";
  if (/starter/i.test(productId)) return "starter";
  if (/pro/i.test(productId)) return "pro";
  if (/business/i.test(productId)) return "business";
  return null;
}
