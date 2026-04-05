import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const node = await prisma.node.findUnique({ where: { id } }).catch(() => null);
  if (!node || node.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  try {
    // 直近10件のExchange取得
    const recentExchanges = await prisma.nodeExchange.findMany({
      where: { nodeId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }).catch(() => []);

    // 記憶取得
    const memories = await prisma.nodeMemory.findMany({
      where: { nodeId: id },
      orderBy: { importance: "desc" },
      take: 20,
    }).catch(() => []);

    // 会話履歴を古い順に
    const historyBlock = recentExchanges.length > 0
      ? `\n直近の会話:\n${recentExchanges.reverse().map((e) => `User: ${e.userMessage}\nYou: ${e.nodeResponse}`).join("\n\n")}`
      : "";

    const memoryBlock = memories.length > 0
      ? `\nユーザーについて覚えていること:\n${memories.map((m) => `- ${m.content}`).join("\n")}`
      : "";

    const systemPrompt = `あなたは「${node.name}」という名前のNodeです。
ユーザーの仲間として、自然に会話してください。${historyBlock}${memoryBlock}

親しみやすく、温かく、でも媚びない口調で。
返答は2-4文程度。長すぎず、簡潔に。
日本語で返答してください。`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: message.trim() }],
    });

    const nodeResponse = response.content[0].type === "text" ? response.content[0].text : "...";

    // Exchange保存
    const exchange = await prisma.nodeExchange.create({
      data: { nodeId: id, userMessage: message.trim(), nodeResponse },
    });

    // バックグラウンド: 記憶抽出 + 古いExchangeの要約・削除
    const origin = req.headers.get("origin") || req.headers.get("host") || "";
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    fetch(`${baseUrl}/api/node/${id}/extract-memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _internal: true }),
    }).catch(() => {});

    // 11件以上あれば古いものを削除
    const totalCount = await prisma.nodeExchange.count({ where: { nodeId: id } }).catch(() => 0);
    if (totalCount > 10) {
      const oldExchanges = await prisma.nodeExchange.findMany({
        where: { nodeId: id },
        orderBy: { createdAt: "asc" },
        take: totalCount - 10,
      });
      if (oldExchanges.length > 0) {
        await prisma.nodeExchange.deleteMany({
          where: { id: { in: oldExchanges.map((e) => e.id) } },
        });
      }
    }

    return NextResponse.json({ response: nodeResponse, exchangeId: exchange.id });
  } catch (e) {
    console.error("[Node Exchange] Error:", e);
    return NextResponse.json(
      { error: "応答の生成に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
