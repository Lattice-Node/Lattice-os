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

function compactPreview(markdown: string) {
  return markdown
    .replace(/^# .+$/gm, "")
    .replace(/^## .+$/gm, "")
    .replace(/^- /gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function splitSections(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const summaryIndex = normalized.indexOf("## 総括");
  const body = summaryIndex >= 0 ? normalized.slice(0, summaryIndex).trim() : normalized;
  const summary = summaryIndex >= 0 ? normalized.slice(summaryIndex).trim() : "";

  const sections = body
    .split(/\n(?=##\s+\d+\.)/)
    .map((section) => section.trim())
    .filter(Boolean);

  const items = sections
    .map((section) => {
      const lines = section.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return null;

      const titleLine = lines[0] || "";
      const title = titleLine.replace(/^##\s+\d+\.\s*/, "").trim();

      const points = lines.slice(1).map((line) => line.replace(/^- /, "").trim());

      return {
        title,
        points,
      };
    })
    .filter(Boolean) as { title: string; points: string[] }[];

  const summaryLines = summary
    ? summary
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("## "))
        .map((line) => line.replace(/^- /, "").trim())
    : [];

  return {
    items,
    summaryLines,
  };
}

export default async function NewsPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <main className="min-h-screen bg-[#111318] text-white">
        <div className="mx-auto w-full max-w-[420px] px-4 pb-24 pt-8">
          <div className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-5">
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
      <main className="min-h-screen bg-[#111318] text-white">
        <div className="mx-auto w-full max-w-[420px] px-4 pb-24 pt-8">
          <div className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-5">
            <p className="text-sm leading-7 text-slate-300">
              ユーザー情報が見つかりませんでした。
            </p>
          </div>
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
      nextRunAt: true,
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
          take: 20,
          select: {
            id: true,
            agentId: true,
            output: true,
            createdAt: true,
          },
        })
      : [];

  const latest = logs[0] ?? null;
  const history = logs.slice(1, 8);
  const parsed = latest ? splitSections(latest.output) : null;

  return (
    <main className="min-h-screen bg-[#111318] text-white">
      <div className="mx-auto w-full max-w-[420px] px-4 pb-28 pt-6">
        <div className="space-y-6">
          <section className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Daily Brief
            </p>

            <div className="space-y-2">
              <h1 className="text-[32px] font-semibold tracking-tight text-white">
                毎日のAIニュース
              </h1>
              <p className="text-sm leading-7 text-slate-400">
                重要なニュースだけを、毎日アプリ内で確認できます。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/agents"
                className="inline-flex h-10 items-center rounded-2xl border border-[#2a2d35] bg-[#1a1d24] px-4 text-sm font-medium text-white transition hover:border-[#6c71e8]"
              >
                My Agent
              </Link>
              <Link
                href="/logs"
                className="inline-flex h-10 items-center rounded-2xl border border-[#2a2d35] bg-transparent px-4 text-sm font-medium text-slate-300 transition hover:border-[#6c71e8] hover:text-white"
              >
                ログ
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <div className="rounded-[24px] border border-[#2a2d35] bg-[#1a1d24] p-4">
              <p className="text-xs text-slate-500">登録Agent</p>
              <p className="mt-2 text-xl font-semibold text-white">{newsAgents.length}</p>
            </div>
            <div className="rounded-[24px] border border-[#2a2d35] bg-[#1a1d24] p-4">
              <p className="text-xs text-slate-500">要約履歴</p>
              <p className="mt-2 text-xl font-semibold text-white">{logs.length}</p>
            </div>
            <div className="rounded-[24px] border border-[#2a2d35] bg-[#1a1d24] p-4">
              <p className="text-xs text-slate-500">配信先</p>
              <p className="mt-2 text-sm font-semibold text-white">アプリ内</p>
            </div>
          </section>

          {latest ? (
            <>
              <section className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      {agentNameMap.get(latest.agentId) ?? "AIニュース要約"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(latest.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#2a2d35] px-3 py-1 text-xs text-slate-300">
                    最新
                  </span>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">今日の要点</h2>
                  <span className="text-xs text-slate-500">
                    {parsed?.items.length ?? 0}件
                  </span>
                </div>

                <div className="space-y-3">
                  {parsed?.items.map((item, index) => (
                    <article
                      key={`${item.title}-${index}`}
                      className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[#2a2d35] px-2 text-xs font-medium text-slate-300">
                          {index + 1}
                        </span>
                      </div>

                      <h3 className="text-[17px] font-semibold leading-7 text-white">
                        {item.title || "ニュース項目"}
                      </h3>

                      <div className="mt-4 space-y-2">
                        {item.points.map((point, pointIndex) => (
                          <p
                            key={`${item.title}-${pointIndex}`}
                            className="text-sm leading-7 text-slate-300"
                          >
                            {point}
                          </p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-5">
                <h2 className="text-base font-semibold text-white">総括</h2>
                <div className="mt-3 space-y-2">
                  {parsed?.summaryLines.length ? (
                    parsed.summaryLines.map((line, index) => (
                      <p key={index} className="text-sm leading-7 text-slate-300">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-slate-400">
                      総括はまだありません。
                    </p>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-5">
              <h2 className="text-base font-semibold text-white">まだ要約がありません</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                My Agent の詳細画面で「実行」を押すと、ここに最新の要約が表示されます。
              </p>
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
                    className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          {agentNameMap.get(log.agentId) ?? "AIニュース要約"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {compactPreview(log.output).slice(0, 180)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-4">
                <p className="text-sm leading-7 text-slate-400">
                  まだ履歴はありません。
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}