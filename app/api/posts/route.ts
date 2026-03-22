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
  const body = await req.json();
  const { slug, title, description, content, secret } = body;
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const post = await prisma.post.upsert({
    where: { slug },
    update: { title, description, content, published: true },
    create: { slug, title, description, content, published: true },
  });
  return NextResponse.json({ success: true, post });
}

export async function DELETE(req: NextRequest) {
  const { slug, secret } = await req.json();
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.post.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}