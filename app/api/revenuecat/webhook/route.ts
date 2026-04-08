/**
 * RevenueCat webhook endpoint.
 *
 * Receives subscription lifecycle events from RevenueCat and updates the
 * user.plan / planExpiresAt / subscriptionPlatform columns accordingly.
 *
 * Spec reference: https://www.revenuecat.com/docs/integrations/webhooks/event-flows
 *
 * Required env:
 * - REVENUECAT_WEBHOOK_AUTH_HEADER : shared secret in the Authorization header
 * - APPLE_PRODUCT_STARTER          : Apple product ID for the Starter plan
 * - APPLE_PRODUCT_PRO              : Apple product ID for the Pro plan
 *
 * Idempotency: every event has an `id`. We track processed event IDs in
 * RevenueCatEventProcessed and skip duplicates. Revenue records are also
 * deduped by externalId in lib/revenue.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordRevenue } from "@/lib/revenue";
import { resetRunsOnUpgrade, isUpgrade } from "@/lib/monthly-runs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RevenueCatEvent {
  id: string;
  type: string;
  app_user_id: string;
  product_id?: string;
  new_product_id?: string;
  expiration_at_ms?: number;
  purchased_at_ms?: number;
  price?: number;
  price_in_purchased_currency?: number;
  currency?: string;
  store?: string;
  environment?: string;
}

interface RevenueCatPayload {
  api_version?: string;
  event: RevenueCatEvent;
}

function productIdToPlan(productId: string | undefined): string | null {
  if (!productId) return null;
  if (productId === process.env.APPLE_PRODUCT_STARTER) return "starter";
  if (productId === process.env.APPLE_PRODUCT_PRO) return "pro";
  // Fallback heuristic so things still work before env vars are set
  if (/starter/i.test(productId)) return "starter";
  if (/pro/i.test(productId)) return "pro";
  if (/business/i.test(productId)) return "business";
  return null;
}

function jpyAmount(event: RevenueCatEvent): number {
  // RevenueCat sends `price` in USD (numeric) and may also send price_in_purchased_currency
  // when the user paid in JPY. Prefer the JPY amount if present.
  if (event.currency === "JPY" && typeof event.price_in_purchased_currency === "number") {
    return Math.round(event.price_in_purchased_currency);
  }
  if (typeof event.price === "number") {
    // Rough USD → JPY conversion fallback
    return Math.round(event.price * 155);
  }
  return 0;
}

async function alreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const found = await prisma.revenueCatEventProcessed.findUnique({
      where: { eventId },
      select: { id: true },
    });
    return !!found;
  } catch {
    return false;
  }
}

async function markProcessed(eventId: string, eventType: string): Promise<void> {
  try {
    await prisma.revenueCatEventProcessed.create({
      data: { eventId, eventType },
    });
  } catch {
    // ignore conflict
  }
}

async function findUserById(appUserId: string) {
  return prisma.user.findUnique({
    where: { id: appUserId },
    select: { id: true, plan: true, subscriptionPlatform: true, planExpiresAt: true },
  });
}

export async function POST(req: Request) {
  // 1. Auth
  const expectedAuth = process.env.REVENUECAT_WEBHOOK_AUTH_HEADER;
  if (expectedAuth) {
    const got = req.headers.get("authorization");
    if (got !== expectedAuth) {
      console.warn("[revenuecat/webhook] auth failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[revenuecat/webhook] REVENUECAT_WEBHOOK_AUTH_HEADER not set — accepting all (dev mode)");
  }

  // 2. Parse
  let payload: RevenueCatPayload;
  try {
    payload = (await req.json()) as RevenueCatPayload;
  } catch (e) {
    console.error("[revenuecat/webhook] invalid JSON", e);
    return NextResponse.json({ ok: true }); // 200 to prevent retry storm
  }

  const event = payload?.event;
  if (!event?.id || !event?.type) {
    console.error("[revenuecat/webhook] missing event id/type", payload);
    return NextResponse.json({ ok: true });
  }

  // 3. Idempotency
  if (await alreadyProcessed(event.id)) {
    console.log(`[revenuecat/webhook] event ${event.id} already processed, skipping`);
    return NextResponse.json({ ok: true, deduped: true });
  }

  // 4. Dispatch — each handler in its own try/catch so one bad event doesn't kill others
  try {
    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "NON_RENEWING_PURCHASE":
        await handleInitialPurchase(event);
        break;
      case "RENEWAL":
        await handleRenewal(event);
        break;
      case "CANCELLATION":
        await handleCancellation(event);
        break;
      case "EXPIRATION":
        await handleExpiration(event);
        break;
      case "BILLING_ISSUE":
        await handleBillingIssue(event);
        break;
      case "PRODUCT_CHANGE":
        await handleProductChange(event);
        break;
      case "TEST":
      case "TRANSFER":
      case "SUBSCRIPTION_PAUSED":
      case "UNCANCELLATION":
        console.log(`[revenuecat/webhook] ${event.type} acknowledged`);
        break;
      default:
        console.warn(`[revenuecat/webhook] unknown event type ${event.type}`);
    }
    await markProcessed(event.id, event.type);
  } catch (e) {
    console.error(`[revenuecat/webhook] handler ${event.type} failed`, e);
    // Still mark processed so we don't loop forever on a code bug
    await markProcessed(event.id, event.type);
  }

  // Always 200 — RevenueCat retries on 5xx, we don't want infinite retries on bugs
  return NextResponse.json({ ok: true });
}

async function handleInitialPurchase(event: RevenueCatEvent) {
  const user = await findUserById(event.app_user_id);
  if (!user) {
    console.warn(`[revenuecat] INITIAL_PURCHASE: user ${event.app_user_id} not found`);
    return;
  }

  const newPlan = productIdToPlan(event.product_id);
  if (!newPlan) {
    console.warn(`[revenuecat] INITIAL_PURCHASE: unknown product ${event.product_id}`);
    return;
  }

  if (user.subscriptionPlatform === "web") {
    console.warn(
      `[revenuecat] INITIAL_PURCHASE: user ${user.id} already has web (Stripe) subscription. Proceeding anyway — manual cleanup may be needed.`
    );
  }

  const upgrading = isUpgrade(user.plan, newPlan);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: newPlan,
      subscriptionPlatform: "ios",
      planExpiresAt: null,
    },
  });

  if (upgrading) {
    await resetRunsOnUpgrade(user.id);
  }

  await recordRevenue({
    date: new Date(event.purchased_at_ms || Date.now()),
    amountJpy: jpyAmount(event),
    userId: user.id,
    platform: "ios",
    productId: event.product_id || newPlan,
    transactionType: "subscription_new",
    externalId: event.id,
  });
}

async function handleRenewal(event: RevenueCatEvent) {
  const user = await findUserById(event.app_user_id);
  if (!user) {
    console.warn(`[revenuecat] RENEWAL: user ${event.app_user_id} not found`);
    return;
  }

  const renewedPlan = productIdToPlan(event.product_id);
  if (renewedPlan && user.plan !== renewedPlan) {
    console.warn(
      `[revenuecat] RENEWAL: user ${user.id} stored plan=${user.plan} but renewal product=${renewedPlan}. Reconciling.`
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: renewedPlan || user.plan,
      subscriptionPlatform: "ios",
      planExpiresAt: null,
      currentPeriodEnd: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
    },
  });

  await recordRevenue({
    date: new Date(event.purchased_at_ms || Date.now()),
    amountJpy: jpyAmount(event),
    userId: user.id,
    platform: "ios",
    productId: event.product_id || renewedPlan || "unknown",
    transactionType: "subscription_renewal",
    externalId: event.id,
  });
}

async function handleCancellation(event: RevenueCatEvent) {
  const user = await findUserById(event.app_user_id);
  if (!user) {
    console.warn(`[revenuecat] CANCELLATION: user ${event.app_user_id} not found`);
    return;
  }

  // Lazy demotion: keep paid plan until expiration_at_ms
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms) : new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: { planExpiresAt: expiresAt },
  });

  await recordRevenue({
    date: new Date(),
    amountJpy: 0,
    userId: user.id,
    platform: "ios",
    productId: event.product_id || "unknown",
    transactionType: "subscription_cancel",
    externalId: event.id,
  });
}

async function handleExpiration(event: RevenueCatEvent) {
  const user = await findUserById(event.app_user_id);
  if (!user) {
    console.warn(`[revenuecat] EXPIRATION: user ${event.app_user_id} not found`);
    return;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "free",
      planExpiresAt: null,
      subscriptionPlatform: null,
    },
  });
}

async function handleBillingIssue(event: RevenueCatEvent) {
  console.warn(
    `[revenuecat] BILLING_ISSUE for user=${event.app_user_id} product=${event.product_id} eventId=${event.id} — Apple grace period in effect, no plan change`
  );
  // Optional: send notification later. For now, just log.
}

async function handleProductChange(event: RevenueCatEvent) {
  const user = await findUserById(event.app_user_id);
  if (!user) {
    console.warn(`[revenuecat] PRODUCT_CHANGE: user ${event.app_user_id} not found`);
    return;
  }
  const newPlan = productIdToPlan(event.new_product_id || event.product_id);
  if (!newPlan) {
    console.warn(
      `[revenuecat] PRODUCT_CHANGE: unknown new product ${event.new_product_id || event.product_id}`
    );
    return;
  }

  const upgrading = isUpgrade(user.plan, newPlan);
  if (upgrading) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: newPlan,
        subscriptionPlatform: "ios",
        planExpiresAt: null,
      },
    });
    await resetRunsOnUpgrade(user.id);
  } else {
    // Downgrade — Apple applies it at next renewal automatically. We do nothing now.
    console.log(
      `[revenuecat] PRODUCT_CHANGE: user ${user.id} downgrade from ${user.plan} → ${newPlan} will apply at next renewal`
    );
  }
}
