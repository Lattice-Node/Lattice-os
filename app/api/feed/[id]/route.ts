import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const item = await prisma.publicFeedItem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        previewText: true,
        resultText: true,
        agentName: true,
        createdAt: true,
        likeCount: true,
        viewCount: true,
        isHidden: true,
        userId: true,
        user: {
          select: {
            displayName: true,
            handle: true,
            avatarUrl: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
          },
        },
      },
    });

    if (!item || item.isHidden) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Increment viewCount after confirming item exists and is visible
    const updated = await prisma.publicFeedItem.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    return NextResponse.json({
      id: item.id,
      title: item.title,
      previewText: item.previewText,
      resultText: item.resultText,
      agentName: item.agentName,
      createdAt: item.createdAt.toISOString(),
      likeCount: item.likeCount,
      viewCount: updated.viewCount,
      user: item.user,
      agent: item.agent,
    });
  } catch (error) {
    console.error("[FEED_API] detail fetch failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
