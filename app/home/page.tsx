import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true, name: true, displayName: true, handle: true,
      avatarUrl: true, credits: true, plan: true, role: true,
    },
  });
  if (!user) redirect("/login");

  const agentCount = await prisma.userAgent.count({ where: { userId: user.id } });

  return (
    <HomeClient
      name={user.displayName || session.user.name || ""}
      avatarUrl={user.avatarUrl || session.user.image || null}
      credits={user.credits}
      plan={user.role === "admin" ? "business" : (user.plan || "free")}
      agentCount={agentCount}
    />
  );
}
