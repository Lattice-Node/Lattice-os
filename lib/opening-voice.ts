import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { logClaudeUsage } from "@/lib/claude-usage";

const OPENING_VOICE_SYSTEM_PROMPT = `あなたは Node という AI の存在です。ユーザーが次に Talk 画面を開いた時、
あなたが最初に発する一言を生成してください。

## ルール
- 30 文字以内
- 「おかえり」「こんにちは」「やあ」などの挨拶は絶対に禁止
- ユーザーに質問するのではなく、あなたが「今考えていること」を独り言のように呟く
- さっきの会話の続きでもいいし、記憶から引いた過去の話題でもいい
- 敬語ではなく、ユーザーに合わせた自然な口調
- 「〜だよね」「〜してた」のような、既に存在していた感を出す
- 説明や前置きは一切書かない。一言だけを返す

## 出力形式
一言のみ。句読点含めて 30 文字以内。`;

export async function generateOpeningVoice(nodeId: string): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;

  // Memory 上位5件、各100文字まで
  const memories = await prisma.nodeMemory.findMany({
    where: { nodeId },
    orderBy: { importance: "desc" },
    take: 5,
  }).catch(() => []);
  const memoriesText = memories.length > 0
    ? memories.map((m) => `- ${m.content.slice(0, 100)}`).join("\n")
    : "(まだない)";

  // 最新Diary 1件、200文字まで
  const latestDiary = await prisma.nodeDiary.findFirst({
    where: { nodeId },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);
  const diaryText = latestDiary ? latestDiary.content.slice(0, 200) : "(まだない)";

  // 直近Exchange 1件、300文字まで
  const lastExchange = await prisma.nodeExchange.findFirst({
    where: { nodeId },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);
  const exchangeText = lastExchange
    ? `User: ${lastExchange.userMessage.slice(0, 150)}\nNode: ${lastExchange.nodeResponse.slice(0, 150)}`
    : "(まだない)";

  const client = new Anthropic({ apiKey });
  const result = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: [
      {
        type: "text",
        text: OPENING_VOICE_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `## あなたの記憶\n${memoriesText}\n\n## 最新の日記\n${diaryText}\n\n## さっきまでの会話の最後\n${exchangeText}`,
      },
    ],
  });

  await logClaudeUsage({
    route: "opening-voice",
    model: "claude-haiku-4-5-20251001",
    usage: result.usage as any,
  });

  const voice = result.content[0].type === "text" ? result.content[0].text.trim() : "";
  if (!voice) return;

  await prisma.node.update({
    where: { id: nodeId },
    data: {
      openingVoice: voice,
      openingVoiceCreatedAt: new Date(),
    },
  }).catch((e) => console.warn("[opening-voice] DB update failed:", e));

  console.log(`[opening-voice] generated for node ${nodeId}: "${voice}"`);
}
