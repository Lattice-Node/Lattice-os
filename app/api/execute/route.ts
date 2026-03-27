import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const agent = await prisma.userAgent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // --- Anthropic API + web_search で実行 ---
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: agent.prompt,
          },
        ],
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 3,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);

      // Anthropic失敗時はGroqにフォールバック
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + (process.env.GROQ_API_KEY || ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "あなたは優秀なAIアシスタントです。日本語で回答してください。" },
            { role: "user", content: agent.prompt },
          ],
          max_tokens: 2048,
        }),
      });

      const groqData = await groqRes.json();
      const fallbackOutput = groqData.choices?.[0]?.message?.content || "実行に失敗しました";

      await prisma.agentLog.create({
        data: {
          agentId: agent.id,
          userId: agent.userId,
          status: "success",
          output: "[Groq fallback] " + fallbackOutput,
        },
      });

      await prisma.userAgent.update({
        where: { id: agentId },
        data: { runCount: { increment: 1 }, lastRunAt: new Date() },
      });

      return NextResponse.json({ success: true, output: fallbackOutput, engine: "groq-fallback" });
    }

    const anthropicData = await anthropicRes.json();

    // contentブロックからtextを抽出
    const textBlocks = anthropicData.content?.filter(
      (block: { type: string }) => block.type === "text"
    ) || [];
    const output = textBlocks.map((block: { text: string }) => block.text).join("\n\n") || "実行結果を取得できませんでした";

    // --- ログ保存 ---
    await prisma.agentLog.create({
      data: {
        agentId: agent.id,
        userId: agent.userId,
        status: "success",
        output: output,
      },
    });

    // --- 実行回数更新 ---
    await prisma.userAgent.update({
      where: { id: agentId },
      data: {
        runCount: { increment: 1 },
        lastRunAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, output, engine: "anthropic-web-search" });
  } catch (error) {
    console.error("Execute error:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}