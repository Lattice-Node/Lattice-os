import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildDailyAiNewsFallback,
  buildDailyAiNewsSystemPrompt,
  buildDailyAiNewsUserPrompt,
  extractTextFromClaudeResponse,
  isDailyAiNewsAgent,
  normalizeDailyAiNewsOutput,
} from "@/lib/agents/daily-ai-news";

export const dynamic = "force-dynamic";

type ExecuteBody = {
  agentId?: string;
  id?: string;
};

type AgentShape = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  prompt: string | null;
  trigger: string | null;
  triggerCron: string | null;
  outputType: string;
  outputConfig: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function buildGenericSystemPrompt() {
  return [
    "あなたはLattice上で動作する有能なAIエージェントです。",
    "ユーザーの依頼を正確に処理してください。",
    "不要な前置きは避け、分かりやすく構造化して出力してください。",
    "日本語で返答してください。",
  ].join("\n");
}

function buildGenericUserPrompt(agent: AgentShape) {
  return [
    `エージェント名: ${agent.name}`,
    agent.description ? `説明: ${agent.description}` : "",
    agent.prompt ? `指示: ${agent.prompt}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function runWithAnthropic(agent: AgentShape, now: Date, isDailyNews: boolean) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = isDailyNews
    ? buildDailyAiNewsSystemPrompt()
    : buildGenericSystemPrompt();

  const userPrompt = isDailyNews
    ? buildDailyAiNewsUserPrompt({ now })
    : buildGenericUserPrompt(agent);

  const message = isDailyNews
    ? await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 1400,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          },
        ],
      })
    : await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 1400,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

  const rawText = extractTextFromClaudeResponse(message.content);

  if (!rawText) {
    throw new Error("Anthropic returned an empty response.");
  }

  return isDailyNews
    ? normalizeDailyAiNewsOutput(rawText, now)
    : rawText.trim();
}

async function runWithGroq(agent: AgentShape, now: Date, isDailyNews: boolean) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const systemPrompt = isDailyNews
    ? [
        buildDailyAiNewsSystemPrompt(),
        "ただしリアルタイム検索が使えない場合は、その旨を曖昧にせず簡潔に示してください。",
      ].join("\n\n")
    : buildGenericSystemPrompt();

  const userPrompt = isDailyNews
    ? buildDailyAiNewsUserPrompt({ now })
    : buildGenericUserPrompt(agent);

  const completion = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const rawText = completion.choices[0]?.message?.content?.trim() || "";

  if (!rawText) {
    throw new Error("Groq returned an empty response.");
  }

  return isDailyNews
    ? normalizeDailyAiNewsOutput(rawText, now)
    : rawText;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as ExecuteBody;
    const agentId =
      typeof body.agentId === "string"
        ? body.agentId
        : typeof body.id === "string"
        ? body.id
        : "";

    if (!agentId) {
      return NextResponse.json(
        { ok: false, error: "agentId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, credits: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "admin" && (user.credits ?? 0) < 2) {
      return NextResponse.json(
        { ok: false, error: "クレジットが不足しています。設定画面から追加してください。" },
        { status: 402 }
      );
    }

    const agent = await prisma.userAgent.findFirst({
      where: {
        id: agentId,
        userId: user.id,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        prompt: true,
        trigger: true,
        triggerCron: true,
        outputType: true,
        outputConfig: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { ok: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    const log = await prisma.agentLog.create({
      data: {
        agentId: agent.id,
        userId: user.id,
        status: "pending",
        output: "",
        error: "",
      },
      select: {
        id: true,
      },
    });

    const isDailyNews = isDailyAiNewsAgent({
      name: agent.name,
      description: agent.description,
      prompt: agent.prompt,
    });

    let finalOutput = "";
    let finalError = "";

    try {
      finalOutput = await runWithAnthropic(agent, now, isDailyNews);
    } catch (anthropicError) {
      const anthropicMessage = getErrorMessage(anthropicError);

      if (isDailyNews) {
        finalError = `Anthropic failed: ${anthropicMessage}`;
      } else {
        try {
          finalOutput = await runWithGroq(agent, now, isDailyNews);
        } catch (groqError) {
          const groqMessage = getErrorMessage(groqError);
          finalError = `Anthropic failed: ${anthropicMessage} / Groq failed: ${groqMessage}`;
        }
      }
    }

    if (!finalOutput && isDailyNews) {
      finalOutput = buildDailyAiNewsFallback(finalError);
    }

    if (!finalOutput && !finalError) {
      finalError = "Execution returned no output.";
    }

    const finalStatus = finalError ? "error" : "success";

    await prisma.agentLog.update({
      where: { id: log.id },
      data: {
        status: finalStatus,
        output: finalOutput,
        error: finalError,
      },
    });

    await prisma.userAgent.update({
      where: { id: agent.id },
      data: {
        runCount: {
          increment: 1,
        },
        lastRunAt: now,
      },
    });

    if (user.role !== "admin") {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 2 } },
      });
    }

    // 外部出力先への送信
    if (finalOutput && agent.outputType !== "app") {
      try {
        const config = JSON.parse(agent.outputConfig || "{}");
        if ((agent.outputType === "discord" || agent.outputType === "app+discord") && config.discordWebhookUrl) {
          await fetch(config.discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `**${agent.name}**\n${finalOutput}`.slice(0, 2000) }),
          });
        }
        if ((agent.outputType === "line" || agent.outputType === "app+line") && config.lineNotifyToken) {
          await fetch("https://notify-api.line.me/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": `Bearer ${config.lineNotifyToken}` },
            body: `message=${encodeURIComponent(`\n${agent.name}\n${finalOutput}`.slice(0, 1000))}`,
          });
        }
      } catch (sendError) {
        console.error("Output delivery failed:", sendError);
      }
    }

    return NextResponse.json({
      ok: !finalError,
      status: finalStatus,
      output: finalOutput,
      error: finalError,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}