import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewsClient from "./NewsClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const newsAgent = await prisma.userAgent.findFirst({
    where: {
      userId: user.id,
      name: { contains: "AI" },
    },
    select: { id: true, name: true, lastRunAt: true },
  });

  let latestLog = null;
  if (newsAgent) {
    latestLog = await prisma.agentLog.findFirst({
      where: { agentId: newsAgent.id, status: "success" },
      orderBy: { createdAt: "desc" },
      select: { output: true, createdAt: true },
    });
  }

  return (
    <NewsClient
      agentId={newsAgent?.id || null}
      agentName={newsAgent?.name || null}
      latestOutput={latestLog?.output || null}
      latestDate={latestLog?.createdAt?.toISOString() || null}
    />
  );
}