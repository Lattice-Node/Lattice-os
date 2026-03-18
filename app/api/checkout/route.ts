import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { agentId, agentName, price } = await req.json();

  if (!price || price <= 0) {
    return NextResponse.json({ error: "無料Agentです" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: agentName,
            description: `Lattice OS - ${agentName} の実行`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/workspace?success=1&agentId=${agentId}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/workspace?canceled=1`,
    metadata: {
      agentId,
      userId: session.user.id ?? session.user.email ?? "",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
