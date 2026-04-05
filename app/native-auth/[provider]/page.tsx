"use client";

import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function NativeAuthPage() {
  const params = useParams();
  const provider = params.provider as string;

  useEffect(() => {
    signIn(provider, { callbackUrl: "/home" });
  }, [provider]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        color: "var(--text-secondary)",
        fontSize: 14,
      }}
    >
      ログイン中...
    </div>
  );
}
