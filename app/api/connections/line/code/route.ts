import { authAny } from "@/lib/auth-any";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.plan !== "business" && user.role !== "admin") {
    return NextResponse.json({ error: "Business plan required" }, { status: 403 });
  }

  await prisma.linkCode.deleteMany({ where: { userId: user.id } });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.linkCode.create({
    data: { userId: user.id, code, expiresAt },
  });

  return NextResponse.json({ code });
}