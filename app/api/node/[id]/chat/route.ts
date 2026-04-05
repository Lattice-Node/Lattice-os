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
  const node = await prisma.node.findUnique({ where: { id } });
  if (!node || node.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // ユーザーメッセージを保存
  await prisma.nodeMessage.create({
    data: { nodeId: id, role: "user", content: message },
  });

  // 記憶を取得
  const memories = await prisma.nodeMemory.findMany({
    where: { nodeId: id },
    orderBy: { importance: "desc" },
    take: 20,
  });

  // 直近の会話履歴を取得
  const history = await prisma.nodeMessage.findMany({
    where: { nodeId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const messages = history.reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // システムプロンプト構築
  const memoryBlock = memories.length > 0
    ? `\nこれまでに覚えていること:\n${memories.map((m) => `- ${m.content}`).join("\n")}`
    : "\nまだユーザーのことをあまり知りません。会話から学んでいきます。";

  const systemPrompt = `あなたは「${node.name}」という名前のNodeです。
ユーザーの仲間として、自然に会話してください。${memoryBlock}

親しみやすく、でも媚びない、少し知的な口調で話してください。
日本語で返答してください。`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const assistantContent =
      response.content[0].type === "text" ? response.content[0].text : "";

    // アシスタントメッセージを保存
    await prisma.nodeMessage.create({
      data: { nodeId: id, role: "assistant", content: assistantContent },
    });

    // バックグラウンドで記憶抽出（非同期、エラー無視）
    const origin = req.headers.get("origin") || req.headers.get("host") || "";
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
    fetch(`${baseUrl}/api/node/${id}/extract-memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _internal: true }),
    }).catch(() => {});

    return NextResponse.json({ message: assistantContent });
  } catch (e) {
    console.error("[Node Chat] API error:", e);
    const fallback = "すみません、今うまく考えがまとまりませんでした。もう一度話しかけてもらえますか？";
    await prisma.nodeMessage.create({
      data: { nodeId: id, role: "assistant", content: fallback },
    });
    return NextResponse.json({ message: fallback });
  }
}
