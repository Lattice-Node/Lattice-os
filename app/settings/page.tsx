import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import ProfileEdit from "./ProfileEdit";
import { Suspense } from "react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      distributedCredits: true,
      purchasedCredits: true,
      plan: true,
      currentPeriodEnd: true,
      role: true,
      handle: true,
      displayName: true,
      avatarUrl: true,
      publicId: true,
    },
  });

  return (
    <Suspense>
      <SettingsClient
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
        image={session.user.image ?? ""}
        credits={(user?.distributedCredits ?? 30) + (user?.purchasedCredits ?? 0)}
        distributedCredits={user?.distributedCredits ?? 30}
        purchasedCredits={user?.purchasedCredits ?? 0}
        plan={user?.plan ?? "free"}
        currentPeriodEnd={user?.currentPeriodEnd?.toISOString() ?? null}
        role={user?.role ?? "user"}
        profileSection={
          <ProfileEdit
            oauthName={session.user.name ?? ""}
            oauthImage={session.user.image ?? ""}
            initialHandle={user?.handle ?? null}
            initialDisplayName={user?.displayName ?? ""}
            initialAvatarUrl={user?.avatarUrl ?? null}
            initialPublicId={user?.publicId ?? null}
          />
        }
      />
    </Suspense>
  );
}
