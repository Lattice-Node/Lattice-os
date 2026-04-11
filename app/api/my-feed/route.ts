import { NextResponse } from "next/server";
import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agents = await prisma.userAgent.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      isPublic: true,
      _count: { select: { publicFeedItems: true } },
      publicFeedItems: { select: { likeCount: true, viewCount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const agentsWithStats = agents.map((a) => ({
    id: a.id,
    name: a.name,
    isPublic: a.isPublic,
    publishedItemCount: a._count.publicFeedItems,
    totalLikes: a.publicFeedItems.reduce((s, i) => s + i.likeCount, 0),
    totalViews: a.publicFeedItems.reduce((s, i) => s + i.viewCount, 0),
  }));

  const items = await prisma.publicFeedItem.findMany({
    where: { userId: user.id, isHidden: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      agentName: true,
      resultText: true,
      likeCount: true,
      viewCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ agents: agentsWithStats, items });
}
