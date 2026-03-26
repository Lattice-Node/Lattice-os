import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function callSlack(webhookUrl: string, message: string): Promise<{ success: boolean; output: string; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
    if (!res.ok) return { success: false, output: "", error: `Slack error: ${res.status}` };
    return { success: true, output: "Slackに送信しました" };
  } catch (e) {
    return { success: false, output: "", error: String(e) };
  }
}

async function planWithAI(prompt: string, task: string): Promise<{ action: string; message: string; summary: string }> {
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `あなたはタスク実行エージェントです。ユーザーの指示を実行して結果をJSON形式で返してください。

必ずこの形式のJSONのみを返してください：
{
  "action": "slack" または "text",
  "message": "実行結果またはSlackに送るメッセージ内容",
  "summary": "何をしたかの一行要約"
}

JSONのみ返すこと。説明文・バッククォート不要。`,
        },
        {
          role: "user",
          content: `エージェント設定: ${prompt}\n\nタスク: ${task}`,
        },
      ],
    }),
  });

  if (!groqRes.ok) throw new Error(`Groq API error: ${groqRes.statusText}`);
  const data = await groqRes.json();
  const text = data.choices?.[0]?.message?.content ?? "{}";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { action: "text", message: text, summary: "テキスト生成完了" };
  }
}

export async function POST(req: NextRequest) {
  const { agentId, agentPrompt, agentName, task } = await req.json();

  if (!agentPrompt) {
    return NextResponse.json({ error: "agentPrompt is required" }, { status: 400 });
  }

  const taskText = task || "タスクを実行してください";
  const startedAt = new Date();
  let status = "success";
  let output = "";
  let error = "";

  try {
    const plan = await planWithAI(agentPrompt, taskText);

    if (plan.action === "slack") {
      let webhookUrl = "";
      if (agentId) {
        const agent = await prisma.userAgent.findUnique({ where: { id: agentId } });
        if (agent) {
          try {
            const conns = JSON.parse(agent.connections);
            if (Array.isArray(conns)) {
              const slack = conns.find((c: { type: string }) => c.type === "slack");
              webhookUrl = slack?.webhookUrl ?? slack?.config?.webhookUrl ?? "";
            }
          } catch {}
        }
      }

      if (webhookUrl) {
        const result = await callSlack(webhookUrl, plan.message);
        output = result.success ? `✓ ${plan.summary}\n\n${plan.message}` : plan.message;
        if (!result.success) {
          error = result.error ?? "";
          status = "error";
        }
      } else {
        output = `[Slack未設定] ${plan.summary}\n\n${plan.message}`;
      }
    } else {
      output = plan.message;
    }

    if (agentId) {
      const agent = await prisma.userAgent.findUnique({ where: { id: agentId } });
      if (agent) {
        await prisma.agentLog.create({
          data: { agentId, userId: agent.userId, status, output, error },
        });
        await prisma.userAgent.update({
          where: { id: agentId },
          data: { runCount: { increment: 1 }, lastRunAt: startedAt },
        });
      }
    }

    return NextResponse.json({ status, output });
  } catch (e) {
    const errMsg = String(e);
    if (agentId) {
      const agent = await prisma.userAgent.findUnique({ where: { id: agentId } });
      if (agent) {
        await prisma.agentLog.create({
          data: { agentId, userId: agent.userId, status: "error", output: "", error: errMsg },
        });
      }
    }
    return NextResponse.json({ status: "error", output: "", error: errMsg }, { status: 500 });
  }
}