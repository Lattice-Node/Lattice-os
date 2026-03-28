import { NextResponse } from "next/server";

function calcNextRunAt(cronExpr: string): Date | null {
  if (!cronExpr) return null;
  try {
    const parts = cronExpr.trim().split(" ");
    if (parts.length !== 5) return null;
    const [min, hour] = parts;
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const next = new Date(jst);
    next.setSeconds(0);
    next.setMilliseconds(0);
    const m = parseInt(min);
    const h = parseInt(hour);
    if (!isNaN(h) && !isNaN(m)) {
      next.setHours(h, m, 0, 0);
      if (next <= jst) next.setDate(next.getDate() + 1);
    } else {
      next.setHours(jst.getHours() + 1, 0, 0, 0);
    }
    return new Date(next.getTime() - 9 * 60 * 60 * 1000);
  } catch {
    return null;
  }
}
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ agents: [] });

  const agents = await prisma.userAgent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: session.user.email, name: session.user.name ?? "" },
    });
  }

  const { name, description, prompt, trigger, triggerCron, connections } = await req.json();
  const nextRunAt = trigger === "schedule" && triggerCron
    ? calcNextRunAt(triggerCron)
    : null;

  const agent = await prisma.userAgent.create({
    data: {
      userId: user.id,
      name,
      description: description ?? "",
      prompt,
      trigger,
      triggerCron: triggerCron ?? "",
      connections: connections ?? "[]",
      nextRunAt,
    },
  });
  return NextResponse.json({ agent });
}