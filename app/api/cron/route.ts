import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { extractTextFromClaudeResponse, isDailyAiNewsAgent, normalizeDailyAiNewsOutput, buildDailyAiNewsSystemPrompt, buildDailyAiNewsUserPrompt } from "@/lib/agents/daily-ai-news";
import { getGmailToken, sendGmailMessage, readGmailMessages } from "@/lib/gmail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getNextRunAt(triggerCron: string | null): Date | null {
  if (!triggerCron) return null;
  let h: number, m: number;
  // Support both "HH:MM" and cron "M H * * *" formats
  const hmMatch = triggerCron.match(/^(\d{1,2}):(\d{2})$/);
  if (hmMatch) {
    h = parseInt(hmMatch[1], 10);
    m = parseInt(hmMatch[2], 10);
  } else {
    const parts = triggerCron.trim().split(/\s+/);
    if (parts.length >= 2) {
      m = parseInt(parts[0], 10);
      h = parseInt(parts[1], 10);
    } else {
      return null;
    }
  }
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  // JST hour h:m → UTC = h-9 (handle day rollover)
  const now = new Date();
  const utcH = h - 9;
  // Get today's date in JST
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = jstNow.getUTCFullYear();
  const month = jstNow.getUTCMonth();
  const day = jstNow.getUTCDate();
  // Build target time in UTC
  let next = new Date(Date.UTC(year, month, day, utcH, m, 0, 0));
  // If utcH is negative, Date.UTC handles it by going to previous day, which is correct
  // If this time has already passed, move to tomorrow
  if (next.getTime() <= now.getTime()) {
    next = new Date(next.getTime() + 24 * 60 * 60 * 1000);
  }
  return next;
}

function buildSystemPrompt() {
  return [
    "あなたはLattice上で動作する有能なAIエージェントです。",
    "ユーザーの依頼を正確に処理してください。",
    "不要な前置きは避け、分かりやすく構造化して出力してください。",
    "日本語で返答してください。",
  ].join("\n");
}

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel cron or manual call)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "true" || req.headers.get("user-agent")?.includes("vercel-cron");
  const isSecretValid = cronSecret && (
    req.headers.get("x-cron-secret") === cronSecret ||
    authHeader === `Bearer ${cronSecret}`
  );

  if (!isVercelCron && !isSecretValid) {
    // Also warm up DB
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, message: "warmup only", ts: Date.now() });
  }

  const now = new Date();

  // Find all active agents with nextRunAt in the past
  const agents = await prisma.userAgent.findMany({
    where: {
      active: true,
      nextRunAt: { lte: now },
    },
    include: {
      user: { select: { id: true, email: true, credits: true, role: true, plan: true } },
    },
  });

  if (agents.length === 0) {
    return NextResponse.json({ ran: 0, message: "No agents to run" });
  }

  const results = [];

  for (const agent of agents) {
    const user = agent.user;
    if (!user) continue;

    // Check credits (skip for admin)
    if (user.role !== "admin" && (user.credits ?? 0) < 2) {
      results.push({ id: agent.id, name: agent.name, status: "skipped", reason: "no credits" });
      continue;
    }

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

      const client = new Anthropic({ apiKey });
      const isDailyNews = isDailyAiNewsAgent({
        name: agent.name,
        description: agent.description,
        prompt: agent.prompt,
      });

      // Gmail context injection
      let extraContext = "";
      const agentText = [agent.name, agent.description, agent.prompt].filter(Boolean).join(" ").toLowerCase();
      const mentionsGmail = agentText.includes("gmail") || agentText.includes("メール") || agentText.includes("mail");
      if (mentionsGmail) {
        try {
          const gmailToken = await getGmailToken(user.id);
          if (gmailToken) {
            const emails = await readGmailMessages(gmailToken, 10);
            if (emails.length > 0) {
              extraContext = "--- 取得したGmailの未読メール ---\n" +
                emails.map((e: { from: string; subject: string; snippet: string; date: string }, i: number) =>
                  `${i + 1}. 差出人: ${e.from}\n 件名: ${e.subject}\n 概要: ${e.snippet}\n 日時: ${e.date}`
                ).join("\n\n");
            }
          }
        } catch {}
      }

      const systemPrompt = isDailyNews ? buildDailyAiNewsSystemPrompt() : buildSystemPrompt();
      const userPrompt = isDailyNews
        ? buildDailyAiNewsUserPrompt({ now })
        : [
            `エージェント名: ${agent.name}`,
            agent.description ? `説明: ${agent.description}` : "",
            agent.prompt ? `指示: ${agent.prompt}` : "",
          ].filter(Boolean).join("\n\n") + (extraContext ? "\n\n" + extraContext : "");

      // Build tools: web_search (always) + client tools (paid plans only)
      const { getAvailableTools, executeTool } = await import("@/lib/agent-tools");
      const userConnections = await prisma.userConnection.findMany({
        where: { userId: user.id },
        select: { provider: true },
      });
      const connProviders = userConnections.map((c: { provider: string }) => c.provider);
      const clientTools = getAvailableTools(user.plan, user.role, connProviders);
      let gmailToken: string | null = null;
      if (connProviders.includes("gmail")) {
        try { gmailToken = await getGmailToken(user.id); } catch {}
      }

      const tools: any[] = [
        { type: "web_search_20250305", name: "web_search" },
        ...clientTools,
      ];

      const messages: any[] = [{ role: "user", content: userPrompt }];
      const MAX_TOOL_LOOPS = 5;
      let loopCount = 0;
      let output = "";

      while (loopCount < MAX_TOOL_LOOPS) {
        loopCount++;

        const message = await client.messages.create({
          model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
          max_tokens: 1400,
          system: systemPrompt,
          messages,
          tools,
        });

        if (message.stop_reason !== "tool_use") {
          output = extractTextFromClaudeResponse(message.content) || "";
          break;
        }

        // Find client tool_use blocks
        const toolUseBlocks = message.content.filter(
          (b: any) => b.type === "tool_use"
        );

        if (toolUseBlocks.length === 0) {
          output = extractTextFromClaudeResponse(message.content) || "";
          break;
        }

        // Execute tools
        const toolResults: any[] = [];
        for (const block of toolUseBlocks as any[]) {
          const result = await executeTool(
            block.name,
            block.input as Record<string, string>,
            {
              userId: user.id,
              gmailToken,
              sendGmailFn: sendGmailMessage as any,
            }
          );
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }

        messages.push({ role: "assistant", content: message.content });
        messages.push({ role: "user", content: toolResults });
      }

      if (isDailyNews) output = normalizeDailyAiNewsOutput(output, now);
      output = output.trim();

      if (!output) throw new Error("Empty response from AI");

      // Save log
      await prisma.agentLog.create({
        data: { agentId: agent.id, userId: user.id, status: "success", output, error: "" },
      });

      // Update agent
      const nextRun = getNextRunAt(agent.triggerCron);
      await prisma.userAgent.update({
        where: { id: agent.id },
        data: {
          runCount: { increment: 1 },
          lastRunAt: now,
          ...(nextRun ? { nextRunAt: nextRun } : {}),
        },
      });

      // Deduct credits
      if (user.role !== "admin") {
        await prisma.user.update({ where: { id: user.id }, data: { credits: { decrement: 2 } } });
      }

      // External output
      if (agent.outputType !== "app") {
        try {
          const config = JSON.parse(agent.outputConfig || "{}");
          if (agent.outputType === "discord") {
            const conn = await prisma.userConnection.findFirst({ where: { userId: user.id, provider: "discord" } });
            const meta = conn ? JSON.parse(conn.metadata || "{}") : {};
            const webhookUrl = config.discordWebhookUrl || meta.webhookUrl || "";
            if (webhookUrl) {
              await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: `**${agent.name}**\n${output}`.slice(0, 2000) }),
              });
            }
          }
          if (agent.outputType === "line") {
            const { sendLineMessage } = await import("@/lib/line");
            const lineConn = await prisma.userConnection.findFirst({ where: { userId: user.id, provider: "line" } });
            if (lineConn?.accessToken) {
              await sendLineMessage(lineConn.accessToken, `${agent.name}\n\n${output}`.slice(0, 5000));
            }
          }
          if (agent.outputType === "gmail") {
            const gmailToken = await getGmailToken(user.id);
            if (gmailToken && config.gmailTo) {
              await sendGmailMessage(gmailToken, config.gmailTo, `[Lattice] ${agent.name}`, output);
            }
          }
        } catch (sendErr) {
          console.error("Output delivery failed:", sendErr);
        }
      }

      results.push({ id: agent.id, name: agent.name, status: "success" });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await prisma.agentLog.create({
        data: { agentId: agent.id, userId: user.id, status: "error", output: "", error: errMsg },
      });

      // Still update nextRunAt so it doesn't retry forever
      const nextRun = getNextRunAt(agent.triggerCron);
      if (nextRun) {
        await prisma.userAgent.update({ where: { id: agent.id }, data: { nextRunAt: nextRun } });
      }

      results.push({ id: agent.id, name: agent.name, status: "error", error: errMsg });
    }
  }

  return NextResponse.json({ ran: results.length, results, ts: Date.now() });
}