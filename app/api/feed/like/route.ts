import { NextResponse } from "next/server";
import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { feedItemId } = await req.json();
  if (!feedItemId) return NextResponse.json({ error: "feedItemId required" }, { status: 400 });

  const existing = await prisma.feedLike.findUnique({
    where: { feedItemId_userId: { feedItemId, userId: user.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.feedLike.delete({ where: { id: existing.id } }),
      prisma.publicFeedItem.update({
        where: { id: feedItemId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ liked: false });
  } else {
    await prisma.$transaction([
      prisma.feedLike.create({ data: { feedItemId, userId: user.id } }),
      prisma.publicFeedItem.update({
        where: { id: feedItemId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ liked: true });
  }
}
