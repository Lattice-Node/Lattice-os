/**
 * RevenueCat client wrapper — static imports.
 *
 * Static imports work because this file is only imported from "use client"
 * components (SettingsClient, RevenueCatBoot) which are never executed during SSR.
 * Dynamic import was causing the SDK module load to hang on iOS.
 */

import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
} from "@revenuecat/purchases-capacitor";

const isEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  if (Capacitor.getPlatform() !== "ios") return false;
  return process.env.NEXT_PUBLIC_IOS_PAYMENT_ENABLED === "true";
};

let initialized = false;

export async function initRevenueCat(userId: string): Promise<void> {
  if (!isEnabled()) return;
  if (initialized) return;

  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY_IOS;
  if (!apiKey) {
    console.warn("[revenuecat] API key not set");
    return;
  }

  try {
    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });
    initialized = true;
    console.log("[revenuecat] initialized for user", userId);
  } catch (e) {
    console.error("[revenuecat] configure failed", e);
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isEnabled()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.error("[revenuecat] getOfferings failed", e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  if (!isEnabled()) {
    throw new Error("IAP not enabled");
  }
  try {
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

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isEnabled()) return null;
  try {
    const result = await Purchases.restorePurchases();
    return result.customerInfo;
  } catch (e) {
    console.error("[revenuecat] restore failed", e);
    return null;
  }
}

export async function getActiveEntitlements(): Promise<string[]> {
  if (!isEnabled()) return [];
  try {
    const result = await Purchases.getCustomerInfo();
    return Object.keys(result.customerInfo.entitlements.active);
  } catch (e) {
    console.error("[revenuecat] getActiveEntitlements failed", e);
    return [];
  }
}

export function productIdToPlan(productId: string | undefined | null): "starter" | "pro" | "business" | null {
  if (!productId) return null;
  if (productId === process.env.NEXT_PUBLIC_APPLE_PRODUCT_STARTER) return "starter";
  if (productId === process.env.NEXT_PUBLIC_APPLE_PRODUCT_PRO) return "pro";
  if (/starter/i.test(productId)) return "starter";
  if (/pro/i.test(productId)) return "pro";
  if (/business/i.test(productId)) return "business";
  return null;
}
