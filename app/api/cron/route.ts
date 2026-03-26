import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const agents = await prisma.userAgent.findMany({
    where: {
      active: true,
      nextRunAt: { lte: now },
    },
  });

  const results = [];
  for (const agent of agents) {
    try {
      const res = await fetch(`${process.env.NEXTAUTH_URL}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
          agentPrompt: agent.prompt,
          task: "Run scheduled task",
        }),
      });

      await prisma.agentLog.create({
        data: {
          agentId: agent.id,
          userId: agent.userId,
          status: res.ok ? "success" : "error",
          output: res.ok ? "Executed successfully" : "",
          error: res.ok ? "" : "Execution failed",
        },
      });

      await prisma.userAgent.update({
        where: { id: agent.id },
        data: {
          lastRunAt: now,
          runCount: { increment: 1 },
        },
      });

      results.push({ id: agent.id, status: "ok" });
    } catch (e) {
      await prisma.agentLog.create({
        data: {
          agentId: agent.id,
          userId: agent.userId,
          status: "error",
          error: String(e),
        },
      });
      results.push({ id: agent.id, status: "error" });
    }
  }

  return NextResponse.json({ ran: results.length, results });
}