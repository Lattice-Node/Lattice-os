"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      // Store invite code in sessionStorage so it persists through login flow
      sessionStorage.setItem("lattice_invite_code", code);
    }
    // Redirect to login — after login, the code will be consumed
    router.replace("/login/");
  }, [code, router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🎁</p>
        <p style={{ fontSize: 16, color: "var(--text-display)", fontWeight: 600, margin: "0 0 4px" }}>Lattice に招待されました</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>ログイン画面に移動します...</p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinContent />
    </Suspense>
  );
}
