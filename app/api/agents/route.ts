import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");
    const session = await auth();

    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      where: mine && session?.user?.id ? { authorId: session.user.id } : undefined,
    });
    return NextResponse.json({ success: true, agents });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { name, description, category, prompt, authorName, price } = body;

    if (!name || !description || !category || !prompt) {
      return NextResponse.json(
        { success: false, error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        category,
        prompt,
        authorName: authorName || session?.user?.name || "anonymous",
        authorId: session?.user?.id || "",
        price: price || 0,
      },
    });
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
