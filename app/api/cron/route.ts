import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResultEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const subscriptions = await prisma.subscription.findMany({
    where: {
      active: true,
      nextRunAt: { lte: now },
    },
  });

  console.log(`Running ${subscriptions.length} subscriptions...`);

  for (const sub of subscriptions) {
    try {
      const agent = await prisma.agent.findUnique({ where: { id: sub.agentId } });
      if (!agent) continue;

      const inputValues = JSON.parse(sub.inputValues);
      const fieldSummary = Object.entries(inputValues)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      const task = `以下の情報をもとに処理してください:\n\n${fieldSummary}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
          max_tokens: 2048,
          messages: [
            { role: "system", content: agent.prompt },
            { role: "user", content: task },
          ],
        }),
      });

      const groqData = await groqRes.json();
      const result = groqData.choices?.[0]?.message?.content ?? "結果を取得できませんでした";

      await sendResultEmail({
        to: sub.userEmail,
        agentName: agent.name,
        result,
      });

      const nextRunAt = new Date();
      switch (sub.frequency) {
        case "daily": nextRunAt.setDate(nextRunAt.getDate() + 1); break;
        case "weekly": nextRunAt.setDate(nextRunAt.getDate() + 7); break;
        case "monthly": nextRunAt.setMonth(nextRunAt.getMonth() + 1); break;
      }

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { lastRunAt: now, nextRunAt },
      });

      console.log(`✅ Sent email to ${sub.userEmail} for ${agent.name}`);
    } catch (err) {
      console.error(`❌ Error for subscription ${sub.id}:`, err);
    }
  }

  return NextResponse.json({ success: true, processed: subscriptions.length });
}
