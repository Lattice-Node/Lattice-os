"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import SettingsClient from "./SettingsClient";
import ProfileEdit from "./ProfileEdit";

function SettingsInner() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/settings")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        setData(await res.json());
      })
      .catch((e) => console.error("[settings] fetch failed", e))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return (
    <SettingsClient
      name={data.name ?? ""}
      email={data.email ?? ""}
      image={data.image ?? ""}
      credits={data.credits ?? 30}
      distributedCredits={data.distributedCredits ?? 0}
      purchasedCredits={data.purchasedCredits ?? 0}
      plan={data.plan ?? "free"}
      currentPeriodEnd={data.currentPeriodEnd ?? null}
      role={data.role ?? "user"}
      profileSection={
        <ProfileEdit
          oauthName={data.name ?? ""}
          oauthImage={data.image ?? ""}
          email={data.email ?? ""}
          initialHandle={data.handle ?? null}
          initialDisplayName={data.displayName ?? ""}
          initialAvatarUrl={data.avatarUrl ?? null}
          initialPublicId={data.publicId ?? null}
        />
      }
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsInner />
    </Suspense>
  );
}
