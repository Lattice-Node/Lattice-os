"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import NewNodeClient from "./NewNodeClient";

export default function NewNodePage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    nativeFetch("/api/me")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login/");
          return;
        }
        setAuthed(true);
      })
      .catch(() => setAuthed(false));
  }, [router]);

  if (authed === null) {
    return <div style={{ padding: 20, color: "var(--text-secondary)" }}>読み込み中...</div>;
  }

  return <NewNodeClient />;
}
