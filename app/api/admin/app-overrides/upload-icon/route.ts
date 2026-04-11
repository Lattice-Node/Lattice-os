import { NextResponse } from "next/server";
import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { appId, imageData } = await req.json();
  if (!appId || !imageData) return NextResponse.json({ error: "appId and imageData required" }, { status: 400 });

  if (!imageData.startsWith("data:image")) {
    return NextResponse.json({ error: "Must be a data:image URL" }, { status: 400 });
  }

  // ~2MB base64 ≈ ~2.7M characters
  if (imageData.length > 2_700_000) {
    return NextResponse.json({ error: "Max 2MB" }, { status: 400 });
  }

  await prisma.appOverride.upsert({
    where: { appId },
    create: { appId, iconImageUrl: imageData },
    update: { iconImageUrl: imageData },
  });

  return NextResponse.json({ ok: true, url: imageData });
}
