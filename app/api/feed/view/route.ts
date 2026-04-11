import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { feedItemId } = await req.json();
  if (!feedItemId) return NextResponse.json({ error: "feedItemId required" }, { status: 400 });

  await prisma.publicFeedItem.update({
    where: { id: feedItemId },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
