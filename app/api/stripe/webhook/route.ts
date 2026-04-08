import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { addCredits, resetCredits } from "@/lib/credits";
import { recordRevenue } from "@/lib/revenue";
import { resetRunsOnUpgrade, isUpgrade } from "@/lib/monthly-runs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_CREDITS: Record<string, number> = {
  starter: 100,
  pro: 500,
  business: 2000,
  personal: 100,  // legacy → starter equivalent
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email;
    const type = session.metadata?.type;

    if (!email) return NextResponse.json({ received: true });

    if (type === "credits") {
      const credits = parseInt(session.metadata?.credits ?? "0");
      if (credits > 0) {
        const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (user) await addCredits(user.id, credits, "purchased", "credit_purchase", session.id);
      }
      // Record revenue
      const amountJpy = session.amount_total ?? 0;
      const userForRev = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      await recordRevenue({
        date: new Date(),
        amountJpy,
        userId: userForRev?.id || null,
        platform: "web",
        productId: `credits_${credits}`,
        transactionType: "one_time",
        externalId: session.id,
      });
    }

    if (type === "subscription") {
      const plan = session.metadata?.plan ?? "starter";
      const credits = PLAN_CREDITS[plan] ?? 100;
      const subscriptionId = session.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
      const periodEnd = new Date(subscription.current_period_end * 1000);

      const subUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, plan: true },
      });
      if (subUser) {
        const upgrading = isUpgrade(subUser.plan, plan);
        await prisma.user.update({
          where: { email },
          data: { plan, stripeSubscriptionId: subscriptionId, currentPeriodEnd: periodEnd },
        });
        await resetCredits(subUser.id, credits, 0, "plan_start", subscriptionId);
        // Tier 1.1: reset monthly runs on upgrade so newly-paid users immediately get the new cap
        if (upgrading) {
          await resetRunsOnUpgrade(subUser.id);
        }
      }
      // Record revenue
      await recordRevenue({
        date: new Date(),
        amountJpy: session.amount_total ?? 0,
        userId: subUser?.id || null,
        platform: "web",
        productId: `plan_${plan}`,
        transactionType: "subscription_new",
        externalId: session.id,
      });
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return NextResponse.json({ received: true });

    // Skip first invoice (handled by checkout.session.completed)
    if (invoice.billing_reason === "subscription_create") {
      return NextResponse.json({ received: true });
    }

    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true, plan: true },
    });
    if (!user) return NextResponse.json({ received: true });

    const plan = user.plan;
    const credits = PLAN_CREDITS[plan] ?? 300;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const periodEnd = new Date(subscription.current_period_end * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { currentPeriodEnd: periodEnd },
    });
    await resetCredits(user.id, credits, 0, "plan_renewal", subscriptionId);
    // Record renewal revenue
    await recordRevenue({
      date: new Date(),
      amountJpy: invoice.amount_paid ?? 0,
      userId: user.id,
      platform: "web",
      productId: `plan_${plan}`,
      transactionType: "subscription_renewal",
      externalId: invoice.id,
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "free", stripeSubscriptionId: null, currentPeriodEnd: null },
      });
      await resetCredits(user.id, 30, 0, "plan_cancel", subscription.id);
      // Record cancellation as zero-amount marker for analytics
      await recordRevenue({
        date: new Date(),
        amountJpy: 0,
        userId: user.id,
        platform: "web",
        productId: `plan_cancel`,
        transactionType: "subscription_cancel",
        externalId: subscription.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}