import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function getNextRunAt(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { agentId, frequency, inputValues, userEmail } = await req.json();

  if (!agentId || !frequency || !userEmail) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id ?? session.user.email ?? "",
      userEmail,
      agentId,
      frequency,
      inputValues: JSON.stringify(inputValues),
      nextRunAt: getNextRunAt(frequency),
    },
  });

  return NextResponse.json({ success: true, subscription });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id ?? session.user.email ?? "" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, subscriptions });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.subscription.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
