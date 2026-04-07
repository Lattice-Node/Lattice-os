import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interests } = await req.json();

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      onboardingCompleted: true,
      interests: Array.isArray(interests) ? interests : [],
    },
  });

  return NextResponse.json({ ok: true });
}
