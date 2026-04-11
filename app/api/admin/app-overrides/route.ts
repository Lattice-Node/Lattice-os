import { prisma } from "@/lib/prisma";
import { authAny } from "@/lib/auth-any";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function requireAdmin(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return user?.role === "admin" ? session : null;
}

export async function GET(req: Request) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const overrides = await prisma.appOverride.findMany();
  return NextResponse.json({ overrides });
}

export async function PUT(req: Request) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { appId, iconName, color1, color2, name } = await req.json();
  if (!appId) return NextResponse.json({ error: "appId required" }, { status: 400 });

  const override = await prisma.appOverride.upsert({
    where: { appId },
    create: { appId, iconName, color1, color2, name },
    update: { iconName, color1, color2, name },
  });

  return NextResponse.json({ override });
}
