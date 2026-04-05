import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.email;

  let name = "";
  let avatarUrl: string | null = null;
  let credits = 0;
  let plan = "free";
  let agentCount = 0;

  if (isLoggedIn) {
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! },
      select: {
        id: true, name: true, displayName: true, handle: true,
        avatarUrl: true, credits: true, plan: true, role: true,
      },
    }).catch(() => null);

    if (user) {
      name = user.displayName || session!.user!.name || "";
      avatarUrl = user.avatarUrl || session!.user!.image || null;
      credits = user.credits ?? 0;
      plan = user.role === "admin" ? "business" : (user.plan || "free");
      agentCount = await prisma.userAgent.count({ where: { userId: user.id } });
    }
  }

  return (
    <HomeClient
      name={name}
      avatarUrl={avatarUrl}
      credits={credits}
      plan={plan}
      agentCount={agentCount}
      isLoggedIn={isLoggedIn}
    />
  );
}
