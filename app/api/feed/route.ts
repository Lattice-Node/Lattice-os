import { NextResponse } from "next/server";
import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Auth is optional for feed viewing
  let userId: string | null = null;
  try {
    const session = await authAny(req);
    if (session?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
      userId = user?.id ?? null;
    }
  } catch {}

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const items = await prisma.publicFeedItem.findMany({
    where: { isHidden: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          handle: true,
          avatarUrl: true,
        },
      },
      ...(userId
        ? { likes: { where: { userId }, select: { id: true } } }
        : {}),
    },
  });

  const result = items.map((item) => ({
    id: item.id,
    agentName: item.agentName,
    resultText: item.resultText,
    likeCount: item.likeCount,
    viewCount: item.viewCount,
    isLikedByMe: userId ? (item as any).likes?.length > 0 : false,
    createdAt: item.createdAt.toISOString(),
    user: item.user,
  }));

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;

  return NextResponse.json({ items: result, nextCursor });
}
