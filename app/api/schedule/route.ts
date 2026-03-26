import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId } = await req.json();
  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  const agent = await prisma.userAgent.findUnique({ where: { id: agentId } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (agent.trigger !== "schedule" || !agent.triggerCron) {
    return NextResponse.json({ error: "Agent is not a schedule trigger" }, { status: 400 });
  }

  const qstashToken = process.env.QSTASH_TOKEN;
  if (!qstashToken) {
    return NextResponse.json({ error: "QSTASH_TOKEN not set" }, { status: 500 });
  }

  const baseUrl = process.env.NEXTAUTH_URL;
  const endpoint = `${baseUrl}/api/execute`;

  try {
    const res = await fetch(`https://qstash.upstash.io/v2/schedules`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${qstashToken}`,
        "Content-Type": "application/json",
        "Upstash-Cron": agent.triggerCron,
        "Upstash-Method": "POST",
        "Upstash-Body": JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
          agentPrompt: agent.prompt,
          task: "スケジュールされたタスクを実行してください",
        }),
      },
      body: JSON.stringify({ destination: endpoint }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `QStash error: ${err}` }, { status: 500 });
    }

    const data = await res.json();

    await prisma.userAgent.update({
      where: { id: agentId },
      data: { triggerCron: agent.triggerCron },
    });

    return NextResponse.json({ success: true, scheduleId: data.scheduleId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}