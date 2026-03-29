import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.plan !== "business" && user.role !== "admin") {
    return NextResponse.json({ error: "Business plan required" }, { status: 403 });
  }

  const { lineUserId } = await req.json();
  if (!lineUserId || typeof lineUserId !== "string" || lineUserId.length < 10) {
    return NextResponse.json({ error: "Invalid LINE user ID" }, { status: 400 });
  }

  const existing = await prisma.userConnection.findFirst({
    where: { userId: user.id, provider: "line" },
  });

  if (existing) {
    await prisma.userConnection.update({
      where: { id: existing.id },
      data: { accessToken: lineUserId, metadata: JSON.stringify({ lineUserId }) },
    });
  } else {
    await prisma.userConnection.create({
      data: {
        userId: user.id,
        provider: "line",
        accessToken: lineUserId,
        metadata: JSON.stringify({ lineUserId }),
      },
    });
  }

  return NextResponse.json({ success: true });
}