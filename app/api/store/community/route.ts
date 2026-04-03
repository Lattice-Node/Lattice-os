import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const agents = await prisma.userAgent.findMany({
    where: { isPublic: true },
    orderBy: { publicUseCount: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      prompt: true,
      trigger: true,
      triggerCron: true,
      publicUseCount: true,
      runCount: true,
      createdAt: true,
      user: {
        select: { name: true },
      },
    },
    take: 50,
  });
  return NextResponse.json({ agents });
}