import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, description: true, createdAt: true },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const { slug, title, description, content, secret } = await req.json();
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const post = await prisma.post.create({
    data: { slug, title, description, content, published: true },
  });
  return NextResponse.json({ success: true, post });
}