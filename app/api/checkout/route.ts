import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { agentId, agentName, price } = await req.json();
  if (!price || price <= 0) {
    return NextResponse.json({ error: "無料プロンプトです" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    return NextResponse.json({ error: "プロンプトが見つかりません" }, { status: 404 });
  }

  const amountJpy = Math.round(price);
  const transferAmount = Math.round(amountJpy * 0.8);

  const checkoutParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: agentName,
            description: `Lattice - ${agentName}`,
          },
          unit_amount: amountJpy,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/apps/${agentId}?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/apps/${agentId}?canceled=1`,
    metadata: {
      agentId,
      userId: session.user.id ?? session.user.email ?? "",
    },
  };

  if (agent.stripeAccountId) {
    checkoutParams.payment_intent_data = {
      transfer_data: {
        destination: agent.stripeAccountId,
        amount: transferAmount,
      },
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);
  return NextResponse.json({ url: checkoutSession.url });
}