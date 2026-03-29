import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No subscription" }, { status: 400 });
  }

  await stripe.subscriptions.cancel(user.stripeSubscriptionId);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "free",
      credits: 30,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    },
  });

  return NextResponse.json({ success: true });
}