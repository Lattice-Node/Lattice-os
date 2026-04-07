"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import InboxList from "./InboxList";

export default function InboxPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nativeFetch("/api/inbox")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const json = await res.json();
        setItems(json.items ?? []);
      })
      .catch((e) => console.error("[inbox] fetch failed", e))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !items) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return <InboxList items={items} />;
}
