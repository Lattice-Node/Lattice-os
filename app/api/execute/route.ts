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

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "あなたは優秀なAIアシスタントです。指示されたタスクを正確にこなしてください。日本語で回答してください。" },
          { role: "user", content: agent.prompt },
        ],
        max_tokens: 2048,
      }),
    });

    const groqData = await groqRes.json();
    const output = groqData.choices?.[0]?.message?.content || "実行結果を取得できませんでした";

    const outputType = agent.outputType || "app";

    if (outputType === "email") {
      console.log("Email output for user:", agent.user.email);
    } else if (outputType === "line") {
      console.log("LINE output for agent:", agent.name);
    } else if (outputType === "discord") {
      console.log("Discord output for agent:", agent.name);
    }

    await prisma.agentLog.create({
      data: {
        agentId: agent.id,
        userId: agent.userId,
        status: "success",
        output: output,
      },
    });

    await prisma.userAgent.update({
      where: { id: agentId },
      data: {
        runCount: { increment: 1 },
        lastRunAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, output, outputType });
  } catch (error) {
    console.error("Execute error:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}