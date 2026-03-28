import { NextResponse } from "next/server";

function calcNextRunAt(cronExpr: string): Date | null {
  if (!cronExpr) return null;
  try {
    const parts = cronExpr.trim().split(" ");
    if (parts.length !== 5) return null;
    const [min, hour] = parts;
    const m = parseInt(min);
    const h = parseInt(hour);
    if (isNaN(h) || isNaN(m)) return null;
    // 現在時刻をUTCで取得
    const now = new Date();
    // JSTで今日のh:mを作る（UTCで表現）
    const todayJST = new Date(now);
    // JSTオフセット: UTC+9
    const jstOffsetMs = 9 * 60 * 60 * 1000;
    // JSTの今日の指定時刻をUTCに変換
    const jstNowMs = now.getTime() + jstOffsetMs;
    const jstDay = new Date(jstNowMs);
    // JST日付のmidnight UTC
    const jstMidnightUTC = new Date(Date.UTC(
      jstDay.getUTCFullYear(),
      jstDay.getUTCMonth(),
      jstDay.getUTCDate(),
      h - 9, m, 0, 0  // JSTのh時をUTCに変換
    ));
    // もし変換結果が負の時間になる場合（h<9）は翌日扱い
    let next = new Date(jstMidnightUTC);
    // 既に過ぎていたら翌日
    if (next.getTime() <= now.getTime()) {
      next = new Date(next.getTime() + 24 * 60 * 60 * 1000);
    }
    return next;
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