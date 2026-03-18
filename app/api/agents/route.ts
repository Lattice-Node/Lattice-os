import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
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
        authorName: authorName || "anonymous",
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