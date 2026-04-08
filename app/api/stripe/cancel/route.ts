import { authAny } from "@/lib/auth-any";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { resetCredits } from "@/lib/credits";
import { checkPaymentEndpointAllowed, getServerPlatform } from "@/lib/monetization";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  // Tier 0: monetization gate.
  const gate = checkPaymentEndpointAllowed(req);
  if (!gate.allowed) {
    const platform = getServerPlatform(req);
    console.warn(`[stripe/cancel] BLOCKED platform=${platform} reason=${gate.reason}`);
    return NextResponse.json({ error: gate.reason, blocked: true }, { status: 403 });
  }

  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No subscription" }, { status: 400 });
  }

  await stripe.subscriptions.cancel(user.stripeSubscriptionId);

  await prisma.user.update({
    where: { id: user.id },
    data: { plan: "free", stripeSubscriptionId: null, currentPeriodEnd: null },
  });
  await resetCredits(user.id, 30, 0, "plan_cancel");

  return NextResponse.json({ success: true });
}