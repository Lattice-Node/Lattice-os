import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewAgentClient from "./NewAgentClient";

export default async function NewAgentPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, role: true },
  });

  const isPaid = user?.role === "admin" || ["starter", "personal", "pro", "business"].includes(user?.plan || "");

  const userConnections = user?.id
    ? await prisma.userConnection.findMany({
        where: { userId: user.id },
        select: { provider: true },
      })
    : [];
  const connectedProviders = userConnections.map((c) => c.provider);

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }} />}>
      <NewAgentClient isPaid={isPaid} connectedProviders={connectedProviders} />
    </Suspense>
  );
}
