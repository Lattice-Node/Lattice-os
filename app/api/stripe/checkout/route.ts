import { authAny } from "@/lib/auth-any";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getYtdRevenue } from "@/lib/revenue";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const CREDIT_PLANS = {
  credits_100: { amount: 500, credits: 100, name: "100 credits" },
  credits_500: { amount: 2000, credits: 500, name: "500 credits" },
  credits_1000: { amount: 3500, credits: 1000, name: "1000 credits" },
};

const SUB_PLANS: Record<string, { priceId: string; plan: string; credits: number }> = {
  // Monthly
  starter: {
    priceId: "price_1TGH0yLgj4qYNhTIoWkdjM2E",  // Starter ¥980/mo (existing)
    plan: "starter",
    credits: 100,
  },
  pro: {
    priceId: "price_1TGsCrLgj4qYNhTIFWLjBQUj",  // Pro ¥2,480/mo
    plan: "pro",
    credits: 500,
  },
  business: {
    priceId: "price_1TGsEILgj4qYNhTI3omZvsC4",  // Business ¥6,980/mo
    plan: "business",
    credits: 2000,
  },
  // Yearly
  starter_yearly: {
    priceId: "price_1TGsFfLgj4qYNhTIdcZwfi0N",  // Starter ¥9,800/yr
    plan: "starter",
    credits: 100,
  },
  pro_yearly: {
    priceId: "price_1TGsDkLgj4qYNhTIjsxR5cdd",  // Pro ¥24,800/yr
    plan: "pro",
    credits: 500,
  },
  business_yearly: {
    priceId: "price_1TGsFALgj4qYNhTIXwV2uOyK",  // Business ¥69,800/yr
    plan: "business",
    credits: 2000,
  },
  // Legacy support
  personal: {
    priceId: "price_1TGH0yLgj4qYNhTIoWkdjM2E",
    plan: "starter",
    credits: 100,
  },
};

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Phase 1: revenue auto-stop guard. Block new purchases when YTD >= ¥750,000.
  // Existing subscribers continue normally (Stripe renewals bypass this endpoint).
  const ytd = await getYtdRevenue();
  if (ytd >= 750_000) {
    return NextResponse.json(
      {
        error: "現在、新規の購入を一時停止しています。少し時間をおいて再度お試しください。",
        autoStop: true,
      },
      { status: 503 }
    );
  }

  const { planId } = await req.json();

  // Credit purchase (one-time)
  const creditPlan = CREDIT_PLANS[planId as keyof typeof CREDIT_PLANS];
  if (creditPlan) {
    const checkout = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: { name: creditPlan.name },
            unit_amount: creditPlan.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/settings?success=credits`,
      cancel_url: `${process.env.NEXTAUTH_URL}/settings`,
      metadata: {
        email: session.email!,
        type: "credits",
        credits: creditPlan.credits.toString(),
      },
    });
    return NextResponse.json({ url: checkout.url });
  }

  // Subscription
  const subPlan = SUB_PLANS[planId];
  if (subPlan) {
    const user = await prisma.user.findUnique({
      where: { email: session.email! },
    });

    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.email!,
        name: user?.name || undefined,
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { email: session.email! },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: subPlan.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/settings?success=subscription`,
      cancel_url: `${process.env.NEXTAUTH_URL}/settings`,
      metadata: {
        email: session.email!,
        type: "subscription",
        plan: subPlan.plan,
        credits: subPlan.credits.toString(),
      },
    });
    return NextResponse.json({ url: checkout.url });
  }

  return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
}