import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLANS = {
  credits_100: { amount: 500, credits: 100, name: "100クレジット" },
  credits_500: { amount: 2000, credits: 500, name: "500クレジット" },
  credits_1000: { amount: 3500, credits: 1000, name: "1000クレジット" },
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await req.json();
  const plan = PLANS[planId as keyof typeof PLANS];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const checkout = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: { name: plan.name },
          unit_amount: plan.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/settings?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings`,
    metadata: {
      email: session.user.email,
      credits: plan.credits.toString(),
    },
  });

  return NextResponse.json({ url: checkout.url });
}
