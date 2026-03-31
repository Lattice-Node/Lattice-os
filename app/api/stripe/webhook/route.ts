import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

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
        await prisma.user.update({
          where: { email },
          data: { credits: { increment: credits } },
        });
      }
    }

    if (type === "subscription") {
      const plan = session.metadata?.plan ?? "starter";
      const credits = PLAN_CREDITS[plan] ?? 100;
      const subscriptionId = session.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
      const periodEnd = new Date(subscription.current_period_end * 1000);

      await prisma.user.update({
        where: { email },
        data: {
          plan,
          credits,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: periodEnd,
        },
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
    });
    if (!user) return NextResponse.json({ received: true });

    const plan = user.plan;
    const credits = PLAN_CREDITS[plan] ?? 300;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const periodEnd = new Date(subscription.current_period_end * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits,
        currentPeriodEnd: periodEnd,
      },
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
        data: {
          plan: "free",
          credits: 30,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}