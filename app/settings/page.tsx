import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { credits: true, plan: true, currentPeriodEnd: true },
  });

  return (
    <SettingsClient
      name={session.user.name ?? ""}
      email={session.user.email ?? ""}
      image={session.user.image ?? ""}
      credits={user?.credits ?? 100}
      plan={user?.plan ?? "free"}
      currentPeriodEnd={user?.currentPeriodEnd?.toISOString() ?? null}
    />
  );
}