import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface TaskDef {
  id: string;
  label: string;
  credits: number;
  type: "daily" | "onetime";
}

const TASKS: TaskDef[] = [
  { id: "daily_login", label: "ログインする", credits: 1, type: "daily" },
  { id: "daily_run", label: "エージェントを1回実行", credits: 2, type: "daily" },
  { id: "onetime_profile", label: "プロフィールを設定", credits: 3, type: "onetime" },
  { id: "onetime_first_agent", label: "最初のエージェントを作成", credits: 3, type: "onetime" },
  { id: "onetime_publish", label: "エージェントを公開する", credits: 3, type: "onetime" },
  { id: "onetime_invite", label: "友達を招待する", credits: 5, type: "onetime" },
];

function todayStart(): Date {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  jst.setUTCHours(0, 0, 0, 0);
  return new Date(jst.getTime() - 9 * 60 * 60 * 1000);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, handle: true, displayName: true, credits: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const start = todayStart();

  // Get today's completions
  const todayCompletions = await prisma.taskCompletion.findMany({
    where: { userId: user.id, createdAt: { gte: start } },
    select: { taskId: true },
  });
  const todayIds = new Set(todayCompletions.map(c => c.taskId));

  // Get all-time onetime completions
  const onetimeCompletions = await prisma.taskCompletion.findMany({
    where: { userId: user.id, taskId: { startsWith: "onetime_" } },
    select: { taskId: true },
  });
  const onetimeIds = new Set(onetimeCompletions.map(c => c.taskId));

  // Check live conditions for claimability
  const [agentCount, publicCount, todayLogs] = await Promise.all([
    prisma.userAgent.count({ where: { userId: user.id } }),
    prisma.userAgent.count({ where: { userId: user.id, isPublic: true } }),
    prisma.agentLog.count({ where: { userId: user.id, createdAt: { gte: start } } }),
  ]);

  const hasProfile = !!(user.handle || user.displayName);

  const tasks = TASKS.map(t => {
    const completed = t.type === "daily" ? todayIds.has(t.id) : onetimeIds.has(t.id);

    // Check if task can be claimed (condition met but not yet claimed)
    let claimable = false;
    if (!completed) {
      switch (t.id) {
        case "daily_login": claimable = true; break;
        case "daily_run": claimable = todayLogs > 0; break;
        case "onetime_profile": claimable = hasProfile; break;
        case "onetime_first_agent": claimable = agentCount > 0; break;
        case "onetime_publish": claimable = publicCount > 0; break;
        case "onetime_invite": claimable = false; break; // Future: check referrals
      }
    }

    return { ...t, completed, claimable };
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCredits = tasks.filter(t => !t.completed).reduce((sum, t) => sum + t.credits, 0);

  return NextResponse.json({ tasks, completedCount, total: tasks.length, remainingCredits: totalCredits, userCredits: user.credits });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await req.json();
  const taskDef = TASKS.find(t => t.id === taskId);
  if (!taskDef) return NextResponse.json({ error: "Invalid task" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, handle: true, displayName: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const start = todayStart();

  // Check if already completed
  if (taskDef.type === "daily") {
    const existing = await prisma.taskCompletion.findFirst({
      where: { userId: user.id, taskId, createdAt: { gte: start } },
    });
    if (existing) return NextResponse.json({ error: "既に完了しています" }, { status: 409 });
  } else {
    const existing = await prisma.taskCompletion.findFirst({
      where: { userId: user.id, taskId },
    });
    if (existing) return NextResponse.json({ error: "既に完了しています" }, { status: 409 });
  }

  // Validate condition
  switch (taskId) {
    case "daily_login": break; // Always claimable
    case "daily_run": {
      const logs = await prisma.agentLog.count({ where: { userId: user.id, createdAt: { gte: start } } });
      if (logs === 0) return NextResponse.json({ error: "今日まだエージェントを実行していません" }, { status: 400 });
      break;
    }
    case "onetime_profile":
      if (!user.handle && !user.displayName) return NextResponse.json({ error: "プロフィールを先に設定してください" }, { status: 400 });
      break;
    case "onetime_first_agent": {
      const count = await prisma.userAgent.count({ where: { userId: user.id } });
      if (count === 0) return NextResponse.json({ error: "エージェントを先に作成してください" }, { status: 400 });
      break;
    }
    case "onetime_publish": {
      const count = await prisma.userAgent.count({ where: { userId: user.id, isPublic: true } });
      if (count === 0) return NextResponse.json({ error: "エージェントを先に公開してください" }, { status: 400 });
      break;
    }
    case "onetime_invite":
      return NextResponse.json({ error: "招待機能は準備中です" }, { status: 400 });
    default:
      return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }

  // Award credits
  await prisma.$transaction([
    prisma.taskCompletion.create({ data: { userId: user.id, taskId, credits: taskDef.credits } }),
    prisma.user.update({ where: { id: user.id }, data: { credits: { increment: taskDef.credits } } }),
  ]);

  return NextResponse.json({ success: true, credits: taskDef.credits });
}
