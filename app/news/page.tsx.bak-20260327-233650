import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

function getPreviewText(markdown: string) {
  return markdown
    .replace(/^# .+$/gm, "")
    .replace(/^## .+$/gm, "")
    .replace(/^- /gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim()
    .slice(0, 220);
}

export default async function NewsPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <main className="mx-auto min-h-screen max-w-[420px] bg-[#111318] px-4 pb-24 pt-8 text-white">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">AI News</p>
          <h1 className="text-3xl font-semibold tracking-tight">AIニュース</h1>
          <div className="rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-5">
            <p className="text-sm leading-7 text-slate-300">
              このページを見るにはログインが必要です。
            </p>
          </div>
        </div>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-[420px] bg-[#111318] px-4 pb-24 pt-8 text-white">
        <div className="rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-5">
          <p className="text-sm leading-7 text-slate-300">
            ユーザー情報が見つかりませんでした。
          </p>
        </div>
      </main>
    );
  }

  const newsAgents = await prisma.userAgent.findMany({
    where: {
      userId: user.id,
      OR: [
        { name: { contains: "AIニュース" } },
        { name: { contains: "AI News" } },
        { description: { contains: "AIニュース" } },
        { prompt: { contains: "AIニュース" } },
      ],
    },
    orderBy: { lastRunAt: "desc" },
    select: {
      id: true,
      name: true,
      active: true,
      lastRunAt: true,
    },
  });

  const agentIds = newsAgents.map((agent) => agent.id);
  const agentNameMap = new Map(newsAgents.map((agent) => [agent.id, agent.name]));

  const logs =
    agentIds.length > 0
      ? await prisma.agentLog.findMany({
          where: {
            userId: user.id,
            agentId: { in: agentIds },
            status: "success",
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            agentId: true,
            output: true,
            createdAt: true,
          },
        })
      : [];

  const latest = logs[0] ?? null;
  const history = logs.slice(1);

  return (
    <main className="mx-auto min-h-screen max-w-[420px] bg-[#111318] px-4 pb-24 pt-8 text-white">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">AI News</p>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">毎日のAIニュース</h1>
              <p className="text-sm leading-7 text-slate-400">
                重要なAIニュースだけを毎日アプリ内で確認できます。
              </p>
            </div>
            <Link
              href="/agents"
              className="inline-flex h-10 items-center rounded-2xl border border-[#2a2d35] px-4 text-sm font-medium text-white transition hover:bg-[#1a1d24]"
            >
              My Agent
            </Link>
          </div>
        </div>

        {latest ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">最新の要約</h2>
              <span className="text-xs text-slate-500">{formatDate(latest.createdAt)}</span>
            </div>

            <div className="rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    {agentNameMap.get(latest.agentId) ?? "AIニュース要約"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(latest.createdAt)}
                  </p>
                </div>
                <span className="rounded-full border border-[#2a2d35] px-3 py-1 text-xs text-slate-300">
                  app
                </span>
              </div>

              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-200">
                {latest.output}
              </pre>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-5">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-white">まだ要約がありません</h2>
              <p className="text-sm leading-7 text-slate-400">
                My Agent の詳細画面で「実行」を押すと、ここに最新のAIニュース要約が表示されます。
              </p>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">過去の要約</h2>
            <span className="text-xs text-slate-500">{history.length}件</span>
          </div>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((log) => (
                <article
                  key={log.id}
                  className="rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">
                      {agentNameMap.get(log.agentId) ?? "AIニュース要約"}
                    </p>
                    <span className="text-xs text-slate-500">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">
                    {getPreviewText(log.output)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-4">
              <p className="text-sm leading-7 text-slate-400">
                まだ履歴はありません。まず1回実行してください。
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}