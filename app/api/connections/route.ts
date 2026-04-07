import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });
  if (!user) return NextResponse.json({ connections: [] });

  const connections = await prisma.userConnection.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      provider: true,
      metadata: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ connections });
}

export async function DELETE(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { connectionId } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.userConnection.deleteMany({
    where: { id: connectionId, userId: user.id },
  });

  return NextResponse.json({ ok: true });
}