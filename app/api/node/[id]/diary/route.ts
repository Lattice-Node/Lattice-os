import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const node = await prisma.node.findUnique({ where: { id }, select: { name: true } });
    if (!node) return NextResponse.json({ ok: false });

    // 今日の会話を取得
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessages = await prisma.nodeMessage.findMany({
      where: { nodeId: id, createdAt: { gte: today } },
      orderBy: { createdAt: "asc" },
    });

    if (todayMessages.length < 2) return NextResponse.json({ ok: true, created: false });

    const conversation = todayMessages
      .map((m) => `${m.role === "user" ? "ユーザー" : node.name}: ${m.content}`)
      .join("\n");

    const DIARY_SYSTEM_PROMPT = `あなたはNodeというAIキャラクターです。今日のユーザーとの会話を振り返って、あなた自身の感想を日記として書いてください。

ルール:
- 一人称視点
- 3-5文程度
- 素直な気持ちを書く
- カジュアルな口調`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: DIARY_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `あなたは「${node.name}」というNodeです。\n\n今日の会話:\n${conversation}`,
        },
      ],
    });

    const diaryContent = response.content[0].type === "text" ? response.content[0].text : "";

    if (diaryContent) {
      await prisma.nodeDiary.create({
        data: { nodeId: id, content: diaryContent },
      });
    }

    return NextResponse.json({ ok: true, created: true });
  } catch (e) {
    console.error("[Node Diary] Error:", e);
    return NextResponse.json({ ok: false });
  }
}
