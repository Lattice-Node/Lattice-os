import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { agentId, userId } = session.metadata ?? {};

    if (agentId && userId) {
      await prisma.purchase.create({
        data: { agentId, userId },
      });
      await prisma.agent.update({
        where: { id: agentId },
        data: { useCount: { increment: 1 } },
      });
    }
  }

  return NextResponse.json({ received: true });
}
