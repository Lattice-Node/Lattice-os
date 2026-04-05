import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addCredits } from "@/lib/credits";

interface TaskDef {
  id: string;
  label: string;
  credits: number;
  type: "daily" | "onetime" | "repeatable";
  category: "daily" | "start" | "feature" | "social";
}

const TASKS: TaskDef[] = [
  { id: "daily_login", label: "ログインする", credits: 1, type: "daily", category: "daily" },
  { id: "daily_run", label: "エージェントを1回実行", credits: 2, type: "daily", category: "daily" },
  { id: "daily_store", label: "ストアを閲覧する", credits: 1, type: "daily", category: "daily" },
  { id: "onetime_profile", label: "プロフィールを設定", credits: 3, type: "onetime", category: "start" },
  { id: "onetime_first_agent", label: "最初のエージェントを作成", credits: 3, type: "onetime", category: "start" },
  { id: "onetime_first_run", label: "エージェントを初めて実行", credits: 2, type: "onetime", category: "start" },
  { id: "onetime_schedule", label: "スケジュール実行を設定", credits: 3, type: "onetime", category: "start" },
  { id: "onetime_publish", label: "エージェントを公開する", credits: 3, type: "onetime", category: "feature" },
  { id: "onetime_copy", label: "コミュニティAgentをコピー", credits: 2, type: "onetime", category: "feature" },
  { id: "onetime_gmail", label: "Gmail連携をする", credits: 3, type: "onetime", category: "feature" },
  { id: "onetime_discord", label: "Discord連携をする", credits: 3, type: "onetime", category: "feature" },
  { id: "onetime_template", label: "テンプレートから作成", credits: 2, type: "onetime", category: "feature" },
  { id: "invite", label: "友達を招待する", credits: 10, type: "repeatable", category: "social" },
];

function todayStart(): Date {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  jst.setUTCHours(0, 0, 0, 0);
  return new Date(jst.getTime() - 9 * 60 * 60 * 1000);
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, handle: true, displayName: true, distributedCredits: true, purchasedCredits: true, referralCode: true, referralCount: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const start = todayStart();

  const [todayCompletions, onetimeCompletions, inviteClaimedCount] = await Promise.all([
    prisma.taskCompletion.findMany({ where: { userId: user.id, createdAt: { gte: start } }, select: { taskId: true } }),
    prisma.taskCompletion.findMany({ where: { userId: user.id, taskId: { startsWith: "onetime_" } }, select: { taskId: true } }),
    prisma.taskCompletion.count({ where: { userId: user.id, taskId: "invite" } }),
  ]);
  const todayIds = new Set(todayCompletions.map(c => c.taskId));
  const onetimeIds = new Set(onetimeCompletions.map(c => c.taskId));

  const [agentCount, publicCount, todayLogs, totalLogs, scheduleCount, copyCount, connections, storeVisited] = await Promise.all([
    prisma.userAgent.count({ where: { userId: user.id } }),
    prisma.userAgent.count({ where: { userId: user.id, isPublic: true } }),
    prisma.agentLog.count({ where: { userId: user.id, createdAt: { gte: start } } }),
    prisma.agentLog.count({ where: { userId: user.id } }),
    prisma.userAgent.count({ where: { userId: user.id, trigger: "schedule" } }),
    prisma.userAgent.count({ where: { userId: user.id, originalAuthorId: { not: null } } }),
    prisma.userConnection.findMany({ where: { userId: user.id }, select: { provider: true } }),
    prisma.taskCompletion.findFirst({ where: { userId: user.id, taskId: "daily_store_visit", createdAt: { gte: start } } }),
  ]);

  const hasProfile = !!(user.handle || user.displayName);
  const providers = new Set(connections.map(c => c.provider));
  const unclaimedInvites = Math.max(0, (user.referralCount || 0) - inviteClaimedCount);

  const tasks = TASKS.map(t => {
    let completed = false;
    let claimable = false;

    if (t.type === "daily") {
      completed = todayIds.has(t.id);
      if (!completed) {
        if (t.id === "daily_login") claimable = true;
        else if (t.id === "daily_run") claimable = todayLogs > 0;
        else if (t.id === "daily_store") claimable = !!storeVisited;
      }
    } else if (t.type === "onetime") {
      completed = onetimeIds.has(t.id);
      if (!completed) {
        if (t.id === "onetime_profile") claimable = hasProfile;
        else if (t.id === "onetime_first_agent") claimable = agentCount > 0;
        else if (t.id === "onetime_first_run") claimable = totalLogs > 0;
        else if (t.id === "onetime_schedule") claimable = scheduleCount > 0;
        else if (t.id === "onetime_publish") claimable = publicCount > 0;
        else if (t.id === "onetime_copy") claimable = copyCount > 0;
        else if (t.id === "onetime_gmail") claimable = providers.has("gmail");
        else if (t.id === "onetime_discord") claimable = providers.has("discord");
        else if (t.id === "onetime_template") claimable = agentCount > 0;
      }
    } else if (t.id === "invite") {
      claimable = unclaimedInvites > 0;
    }

    return { ...t, completed, claimable, ...(t.id === "invite" ? { count: user.referralCount || 0, unclaimed: unclaimedInvites } : {}) };
  });

  const dailyTasks = tasks.filter(t => t.category === "daily");
  const startTasks = tasks.filter(t => t.category === "start");
  const featureTasks = tasks.filter(t => t.category === "feature");
  const socialTasks = tasks.filter(t => t.category === "social");

  const dailyCompleted = dailyTasks.filter(t => t.completed).length;
  const startCompleted = startTasks.filter(t => t.completed).length;
  const featureCompleted = featureTasks.filter(t => t.completed).length;

  return NextResponse.json({
    daily: dailyTasks, start: startTasks, feature: featureTasks, social: socialTasks,
    dailyCompleted, dailyTotal: dailyTasks.length,
    startCompleted, startTotal: startTasks.length,
    featureCompleted, featureTotal: featureTasks.length,
    userCredits: user.distributedCredits + user.purchasedCredits,
    referralCode: user.referralCode,
    referralCount: user.referralCount || 0,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { taskId, action } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, handle: true, displayName: true, referralCode: true, referralCount: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate referral code
  if (action === "generate_referral") {
    if (user.referralCode) return NextResponse.json({ referralCode: user.referralCode });
    let code = generateReferralCode();
    for (let i = 0; i < 10; i++) {
      const exists = await prisma.user.findFirst({ where: { referralCode: code } });
      if (!exists) break;
      code = generateReferralCode();
    }
    await prisma.user.update({ where: { id: user.id }, data: { referralCode: code } });
    return NextResponse.json({ referralCode: code });
  }

  // Store visit tracking
  if (action === "store_visit") {
    const start = todayStart();
    const existing = await prisma.taskCompletion.findFirst({
      where: { userId: user.id, taskId: "daily_store_visit", createdAt: { gte: start } },
    });
    if (!existing) await prisma.taskCompletion.create({ data: { userId: user.id, taskId: "daily_store_visit", credits: 0 } });
    return NextResponse.json({ success: true });
  }

  // Claim task
  const taskDef = TASKS.find(t => t.id === taskId);
  if (!taskDef) return NextResponse.json({ error: "Invalid task" }, { status: 400 });

  const start = todayStart();

  if (taskDef.type === "daily") {
    const dup = await prisma.taskCompletion.findFirst({ where: { userId: user.id, taskId, createdAt: { gte: start } } });
    if (dup) return NextResponse.json({ error: "既に完了しています" }, { status: 409 });
  } else if (taskDef.type === "onetime") {
    const dup = await prisma.taskCompletion.findFirst({ where: { userId: user.id, taskId } });
    if (dup) return NextResponse.json({ error: "既に完了しています" }, { status: 409 });
  }

  // Validate
  const err = await validateTask(taskId, user.id, start, user);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  await prisma.taskCompletion.create({ data: { userId: user.id, taskId, credits: taskDef.credits } });
  await addCredits(user.id, taskDef.credits, "distributed", "task", taskId);

  return NextResponse.json({ success: true, credits: taskDef.credits });
}

async function validateTask(taskId: string, userId: string, start: Date, user: { handle: string | null; displayName: string; referralCount: number | null }): Promise<string | null> {
  switch (taskId) {
    case "daily_login": return null;
    case "daily_run": { const c = await prisma.agentLog.count({ where: { userId, createdAt: { gte: start } } }); return c === 0 ? "今日まだエージェントを実行していません" : null; }
    case "daily_store": { const v = await prisma.taskCompletion.findFirst({ where: { userId, taskId: "daily_store_visit", createdAt: { gte: start } } }); return v ? null : "ストアをまだ閲覧していません"; }
    case "onetime_profile": return (user.handle || user.displayName) ? null : "プロフィールを先に設定してください";
    case "onetime_first_agent": { const c = await prisma.userAgent.count({ where: { userId } }); return c > 0 ? null : "エージェントを先に作成してください"; }
    case "onetime_first_run": { const c = await prisma.agentLog.count({ where: { userId } }); return c > 0 ? null : "エージェントを先に実行してください"; }
    case "onetime_schedule": { const c = await prisma.userAgent.count({ where: { userId, trigger: "schedule" } }); return c > 0 ? null : "スケジュール実行を設定してください"; }
    case "onetime_publish": { const c = await prisma.userAgent.count({ where: { userId, isPublic: true } }); return c > 0 ? null : "エージェントを先に公開してください"; }
    case "onetime_copy": { const c = await prisma.userAgent.count({ where: { userId, originalAuthorId: { not: null } } }); return c > 0 ? null : "コミュニティAgentをコピーしてください"; }
    case "onetime_gmail": { const c = await prisma.userConnection.count({ where: { userId, provider: "gmail" } }); return c > 0 ? null : "Gmailを先に連携してください"; }
    case "onetime_discord": { const c = await prisma.userConnection.count({ where: { userId, provider: "discord" } }); return c > 0 ? null : "Discordを先に連携してください"; }
    case "onetime_template": { const c = await prisma.userAgent.count({ where: { userId } }); return c > 0 ? null : "テンプレートからエージェントを作成してください"; }
    case "invite": { const claimed = await prisma.taskCompletion.count({ where: { userId, taskId: "invite" } }); return claimed < (user.referralCount || 0) ? null : "未受取の招待報酬がありません"; }
    default: return "Invalid task";
  }
}
