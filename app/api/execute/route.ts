import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consumeCredits } from "@/lib/credits";
import { getGmailToken, sendGmailMessage, readGmailMessages } from "@/lib/gmail";
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
    "あなたはLattice上で動作するAIエージェントです。",
    "ユーザーの依頼を正確に処理してください。",
    "",
    "【重要なルール】",
    "- 「できません」「実現できません」とは絶対に言わないでください。与えられた情報とツールで最善を尽くしてください。",
    "- Gmailの未読メールなどの外部データが提供されている場合、それはシステムが自動取得したものです。そのまま活用してください。",
    "- fetch_urlツールが利用可能な場合、指定されたURLの内容を実際に取得して分析してください。",
    "- send_gmailツールが利用可能な場合、メール送信を実行してください。",
    "- 他のサービス（Zapier、Google Apps Script等）を勧めないでください。あなたがLatticeのエージェントです。",
    "- 不要な前置きは避け、分かりやすく構造化して出力してください。",
    "- 日本語で返答してください。",
  ].join("\n");
}

function buildGenericUserPrompt(agent: AgentShape, extraContext?: string) {
  return [
    `エージェント名: ${agent.name}`,
    agent.description ? `説明: ${agent.description}` : "",
    agent.prompt ? `指示: ${agent.prompt}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    + (extraContext ? "\n\n" + extraContext : "");
}

async function runWithAnthropic(
  agent: AgentShape,
  now: Date,
  isDailyNews: boolean,
  extraContext?: string,
  toolContext?: {
    clientTools: import("@/lib/agent-tools").ToolDefinition[];
    userId: string;
    gmailToken?: string | null;
  }
) {
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
    : buildGenericUserPrompt(agent, extraContext);

  // Build tools array: web_search (server) + client tools
  const tools: any[] = [
    { type: "web_search_20250305", name: "web_search" },
  ];
  if (toolContext?.clientTools) {
    for (const t of toolContext.clientTools) {
      tools.push(t);
    }
  }

  const messages: any[] = [{ role: "user", content: userPrompt }];
  const MAX_TOOL_LOOPS = 5;
  let loopCount = 0;

  while (loopCount < MAX_TOOL_LOOPS) {
    loopCount++;

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 1400,
      system: systemPrompt,
      messages,
      tools,
    });

    // If stop_reason is "end_turn" or no tool_use, we're done
    if (message.stop_reason !== "tool_use") {
      const rawText = extractTextFromClaudeResponse(message.content);
      if (!rawText) throw new Error("Anthropic returned an empty response.");
      return isDailyNews ? normalizeDailyAiNewsOutput(rawText, now) : rawText.trim();
    }

    // Find tool_use blocks (client tools only, server tools are handled automatically)
    const toolUseBlocks = message.content.filter(
      (b: any) => b.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      // Only server tool results, extract text
      const rawText = extractTextFromClaudeResponse(message.content);
      if (!rawText) throw new Error("Anthropic returned an empty response.");
      return isDailyNews ? normalizeDailyAiNewsOutput(rawText, now) : rawText.trim();
    }

    // Execute each client tool and build tool_result messages
    const toolResults: any[] = [];
    for (const block of toolUseBlocks as any[]) {
      const { executeTool } = await import("@/lib/agent-tools");
      const result = await executeTool(
        block.name,
        block.input as Record<string, string>,
        {
          userId: toolContext?.userId || "",
          gmailToken: toolContext?.gmailToken,
          sendGmailFn: sendGmailMessage,
        }
      );
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }

    // Add assistant response + tool results to messages for next loop
    messages.push({ role: "assistant", content: message.content });
    messages.push({ role: "user", content: toolResults });
  }

  // Max loops reached, extract whatever text we have
  throw new Error("Tool use loop exceeded maximum iterations.");
}

async function runWithGroq(agent: AgentShape, now: Date, isDailyNews: boolean, extraContext?: string) {
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
    : buildGenericUserPrompt(agent, extraContext);

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
      select: { id: true, credits: true, role: true, plan: true },
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

    // Agent Memory: Pro/Business/adminのみ直近5件のログをコンテキスト注入
    let memoryContext = "";
    const isPaidPlan = user.role === "admin" || user.plan === "pro" || user.plan === "business";
    if (isPaidPlan) {
      const recentLogs = await prisma.agentLog.findMany({
        where: { agentId: agent.id, status: "success" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { output: true, createdAt: true },
      });
      if (recentLogs.length > 0) {
        memoryContext = "--- 過去の実行履歴（最新5件）---\n" + recentLogs.map((log, i) => {
          const d = new Date(log.createdAt);
          const dateStr = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;
          const snippet = log.output.slice(0, 300);
          return `[${dateStr}]\n${snippet}`;
        }).join("\n\n");
      }
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

    // Gmail連携済みならメールを取得してコンテキストに注入
    let extraContext = "";
    const agentText = [agent.name, agent.description, agent.prompt].filter(Boolean).join(" ").toLowerCase();
    const mentionsGmail = agentText.includes("gmail") || agentText.includes("メール") || agentText.includes("mail");
    if (mentionsGmail) {
      try {
        const gmailToken = await getGmailToken(user.id);
        if (gmailToken) {
          const emails = await readGmailMessages(gmailToken, 10);
          if (emails.length > 0) {
            extraContext = "--- 取得したGmailの未読メール ---\n" + emails.map((e, i) =>
              `${i + 1}. 差出人: ${e.from}\n   件名: ${e.subject}\n   概要: ${e.snippet}\n   日時: ${e.date}`
            ).join("\n\n");
          } else {
            extraContext = "--- Gmail: 未読メールはありません ---";
          }
        }
      } catch (gmailErr) {
        console.error("Gmail read error:", gmailErr);
      }
    }

    let finalOutput = "";
    let finalError = "";

    // Build tool context for Phase 2 Tool Use
    const { getAvailableTools } = await import("@/lib/agent-tools");
    const userConnections = await prisma.userConnection.findMany({
      where: { userId: user.id },
      select: { provider: true },
    });
    const connProviders = userConnections.map(c => c.provider);
    const clientTools = getAvailableTools(user.plan, user.role, connProviders);
    let gmailToken: string | null = null;
    if (connProviders.includes("gmail")) {
      try { gmailToken = await getGmailToken(user.id); } catch {}
    }

    try {
      finalOutput = await runWithAnthropic(agent, now, isDailyNews, extraContext + (memoryContext ? "\n\n" + memoryContext : ""), {
        clientTools,
        userId: user.id,
        gmailToken,
      });
    } catch (anthropicError) {
      const anthropicMessage = getErrorMessage(anthropicError);

      if (isDailyNews) {
        finalError = `Anthropic failed: ${anthropicMessage}`;
      } else {
        try {
          finalOutput = await runWithGroq(agent, now, isDailyNews, extraContext);
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
      await consumeCredits(user.id, 2, "agent_exec", agentId);
    }

    // 外部出力先への送信
    if (finalOutput && agent.outputType !== "app") {
      try {
        const config = JSON.parse(agent.outputConfig || "{}");
        // UserConnectionから自動取得
        const conn = await prisma.userConnection.findFirst({
          where: { userId: user.id, provider: agent.outputType },
        });
        const connMeta = conn ? JSON.parse(conn.metadata || "{}") : {};
        let webhookUrl = (config.discordWebhookUrl || connMeta.webhookUrl) || "";

        // outputConfigにURLがない場合、UserConnectionから取得
        if (!webhookUrl && agent.outputType === "discord") {
          const conn = await prisma.userConnection.findFirst({
            where: { userId: user.id, provider: "discord" },
          });
          if (conn) {
            const meta = JSON.parse(conn.metadata || "{}");
            webhookUrl = meta.webhookUrl || "";
          }
        }

        if (agent.outputType === "discord" && webhookUrl) {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `**${agent.name}**\n${finalOutput}`.slice(0, 2000) }),
          });
        }

        if (agent.outputType === "line") {
          const { sendLineMessage } = await import("@/lib/line");
          const lineConn = await prisma.userConnection.findFirst({
            where: { userId: user.id, provider: "line" },
          });
          if (lineConn?.accessToken) {
            await sendLineMessage(
              lineConn.accessToken,
              `${agent.name}\n\n${finalOutput}`.slice(0, 5000)
            );
          }
        }
        if (agent.outputType === "gmail") {
          const gmailToken = await getGmailToken(user.id);
          if (gmailToken) {
            const gmailTo = config.gmailTo || "";
            if (gmailTo) {
              await sendGmailMessage(
                gmailToken,
                gmailTo,
                `[Lattice] ${agent.name}`,
                finalOutput
              );
            }
          }
        }
      } catch (sendError) {
        console.error("Output delivery failed:", sendError);
      }
    }

    // プッシュ通知
    try {
      const deviceTokens = await prisma.deviceToken.findMany({
        where: { userId: user.id },
        select: { token: true },
      });
      if (deviceTokens.length > 0) {
        const { sendPushNotification } = await import("@/lib/fcm");
        const tokens = deviceTokens.map(d => d.token);
        const title = finalError ? agent.name + " \u5b9f\u884c\u30a8\u30e9\u30fc" : agent.name + " \u5b9f\u884c\u5b8c\u4e86";
        const body = finalError ? "\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f" : (finalOutput.slice(0, 80) + (finalOutput.length > 80 ? "..." : ""));
        await sendPushNotification(tokens, title, body);
      }
    } catch (pushError) {
      console.error("Push notification failed:", pushError);
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
