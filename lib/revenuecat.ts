/**
 * RevenueCat client wrapper.
 *
 * Phase 2 stub: returns empty/null when iOS payment is disabled. Once the
 * @revenuecat/purchases-capacitor SDK is installed and NEXT_PUBLIC_IOS_PAYMENT_ENABLED
 * is set to "true", this file is the ONLY one that needs to change. Every other
 * caller in the codebase imports these stable function signatures.
 */

const isEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  if (!cap?.getPlatform) return false;
  if (cap.getPlatform() !== "ios") return false;
  return process.env.NEXT_PUBLIC_IOS_PAYMENT_ENABLED === "true";
};

/**
 * Initialize RevenueCat with the user's app user ID.
 * Call this once after login (and on app launch when a session exists).
 */
export async function initRevenueCat(userId: string): Promise<void> {
  if (!isEnabled()) return;
  // TODO: enable after SDK install
  // const { Purchases } = await import("@revenuecat/purchases-capacitor");
  // await Purchases.configure({
  //   apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY_IOS!,
  //   appUserID: userId,
  // });
  void userId;
}

/**
 * Fetch the active offering (collection of purchasable packages).
 * Returns null when IAP is disabled or before SDK install.
 */
export async function getOfferings(): Promise<unknown> {
  if (!isEnabled()) return null;
  // TODO: enable after SDK install
  // const { Purchases } = await import("@revenuecat/purchases-capacitor");
  // const offerings = await Purchases.getOfferings();
  // return offerings.current;
  return null;
}

/**
 * Initiate an IAP purchase. Throws if IAP is not enabled or before SDK install.
 */
export async function purchasePackage(packageIdentifier: string): Promise<unknown> {
  if (!isEnabled()) {
    throw new Error("IAP not enabled");
  }
  // TODO: enable after SDK install
  // const { Purchases } = await import("@revenuecat/purchases-capacitor");
  // const offerings = await Purchases.getOfferings();
  // const pkg = offerings.current?.availablePackages.find((p: any) => p.identifier === packageIdentifier);
  // if (!pkg) throw new Error(`Package ${packageIdentifier} not found`);
  // const result = await Purchases.purchasePackage({ aPackage: pkg });
  // return result;
  void packageIdentifier;
  throw new Error("Not implemented yet");
}

/**
 * Restore previous purchases. Required by Apple Guideline 3.1.1.
 * Returns null when IAP is disabled.
 */
export async function restorePurchases(): Promise<unknown> {
  if (!isEnabled()) return null;
  // TODO: enable after SDK install
  // const { Purchases } = await import("@revenuecat/purchases-capacitor");
  // const customerInfo = await Purchases.restorePurchases();
  // return customerInfo;
  return null;
}

/**
 * Get the user's currently-active entitlement IDs (e.g. ["pro"]).
 * Returns empty array when IAP is disabled.
 */
export async function getActiveEntitlements(): Promise<string[]> {
  if (!isEnabled()) return [];
  // TODO: enable after SDK install
  // const { Purchases } = await import("@revenuecat/purchases-capacitor");
  // const info = await Purchases.getCustomerInfo();
  // return Object.keys(info.customerInfo.entitlements.active);
  return [];
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
