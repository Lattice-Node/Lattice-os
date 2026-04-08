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

    // 直近20件の会話を取得
    const recent = await prisma.nodeMessage.findMany({
      where: { nodeId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    if (recent.length < 2) return NextResponse.json({ ok: true, extracted: 0 });

    const conversation = recent
      .reverse()
      .map((m) => `${m.role === "user" ? "ユーザー" : node.name}: ${m.content}`)
      .join("\n");

    const EXTRACT_SYSTEM_PROMPT = `あなたはユーザーとAIの会話ログから「覚えておくべき情報」を抽出するAIです。

抽出基準:
- ユーザーの職業、興味、好み
- 継続的に関係する情報
- 将来の会話で参照すべき内容

既に保存済みの情報と重複する場合は抽出しないでください。
新しい情報がなければ空配列を返してください。

JSONのみで返してください（マークダウンコードブロック不要）:
{"memories":[{"content":"...","importance":1-10}]}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: EXTRACT_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `会話:\n${conversation}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.memories && Array.isArray(parsed.memories)) {
      for (const mem of parsed.memories) {
        if (mem.content && typeof mem.content === "string") {
          await prisma.nodeMemory.create({
            data: {
              nodeId: id,
              content: mem.content,
              importance: Math.min(10, Math.max(1, parseInt(mem.importance) || 5)),
            },
          });
        }
      }
      return NextResponse.json({ ok: true, extracted: parsed.memories.length });
    }

    return NextResponse.json({ ok: true, extracted: 0 });
  } catch (e) {
    console.error("[Node Memory Extract] Error:", e);
    return NextResponse.json({ ok: false });
  }
}
