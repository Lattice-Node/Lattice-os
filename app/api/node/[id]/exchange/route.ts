import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateOpeningVoice } from "@/lib/opening-voice";

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

    // Core Memory: 重要度上位10件
    const memories = await prisma.nodeMemory.findMany({
      where: { nodeId: id },
      orderBy: { importance: "desc" },
      take: 10,
    }).catch(() => []);

    // ── キャッシュ対象: Node人格 + Core Memory ──
    const basePersonaPrompt = `あなたは「${node.name}」という名前のNodeです。
ユーザーの仲間として、自然に会話してください。
親しみやすく、温かく、でも媚びない口調で。
返答は2-4文程度。長すぎず、簡潔に。
日本語で返答してください。`;

    const formattedCoreMemories = memories.length > 0
      ? `ユーザーについて覚えていること:\n${memories.map((m) => `- ${m.content}`).join("\n")}`
      : "まだユーザーのことをあまり知りません。会話から学んでいきます。";

    // ── 非キャッシュ: 直近Exchange → messages配列 ──
    const exchangeMessages: { role: "user" | "assistant"; content: string }[] = [];
    const sorted = [...recentExchanges].reverse();
    for (const ex of sorted) {
      exchangeMessages.push({ role: "user", content: ex.userMessage });
      exchangeMessages.push({ role: "assistant", content: ex.nodeResponse });
    }
    exchangeMessages.push({ role: "user", content: message.trim() });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: [
        {
          type: "text",
          text: basePersonaPrompt,
        },
        {
          type: "text",
          text: formattedCoreMemories,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: exchangeMessages,
    });

    // キャッシュ効果ログ
    const usage = response.usage as any;
    console.log(`[Node Exchange] tokens: input=${usage.input_tokens}, cache_create=${usage.cache_creation_input_tokens ?? 0}, cache_read=${usage.cache_read_input_tokens ?? 0}, output=${usage.output_tokens}`);

    const nodeResponse = response.content[0].type === "text" ? response.content[0].text : "...";

    // Exchange保存（テーブル未作成なら無視）
    let exchangeId = "";
    try {
      const exchange = await prisma.nodeExchange.create({
        data: { nodeId: id, userMessage: message.trim(), nodeResponse },
      });
      exchangeId = exchange.id;

      const totalCount = await prisma.nodeExchange.count({ where: { nodeId: id } });
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
    } catch (dbErr) {
      console.warn("[Node Exchange] DB save failed:", dbErr);
    }

    // バックグラウンド: 記憶抽出
    try {
      const origin = req.headers.get("origin") || req.headers.get("host") || "";
      const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
      fetch(`${baseUrl}/api/node/${id}/extract-memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _internal: true }),
      }).catch(() => {});
    } catch {}

    const resp = NextResponse.json({ response: nodeResponse, exchangeId });

    // fire-and-forget: 次回Opening Voice生成
    void generateOpeningVoice(id).catch((e) =>
      console.error("[opening-voice] generation failed", e)
    );

    return resp;
  } catch (e) {
    console.error("[Node Exchange] Error:", e);
    const errMsg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `応答の生成に失敗しました: ${errMsg}` },
      { status: 500 }
    );
  }
}
