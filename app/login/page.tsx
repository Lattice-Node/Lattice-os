"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("ref");
  const errParam = searchParams.get("error");
  const [refSaved, setRefSaved] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[LOGIN PAGE] mounted at", new Date().toISOString());
    if (ref) {
      sessionStorage.setItem("lattice_ref", ref);
      setRefSaved(true);
    }
    setIsNative(!!(window as any).Capacitor?.isNativePlatform?.());

    if (errParam === "Configuration" && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState(null, "", url.toString());
    }
    return () => {
      console.log("[LOGIN PAGE] unmounted at", new Date().toISOString());
    };
  }, [ref, errParam]);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading("google");
    setLoginError(null);

    if (!isNative) {
      signIn("google", { callbackUrl: "/home/" });
      return;
    }

    try {
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");

      const signInPromise = FirebaseAuthentication.signInWithGoogle();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT after 30s")), 30000)
      );
      await Promise.race([signInPromise, timeoutPromise]);

      const tokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
      const idToken = tokenResult.token;
      if (!idToken) throw new Error("Failed to get Firebase ID token");

      const sessionRes = await fetch("https://www.lattice-protocol.com/api/auth/native-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        throw new Error(`認証サーバエラー (${sessionRes.status})`);
      }

      const data = await sessionRes.json();
      if (data.sessionToken) {
        const { saveNativeSession } = await import("@/lib/native-fetch");
        await saveNativeSession(data.sessionToken);
      }

      await new Promise((r) => setTimeout(r, 150));
      router.replace("/home/");
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[login] google native failed", msg);
      setLoginError("ログインに失敗しました。もう一度お試しください。");
      setLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    if (loading) return;
    setLoading("apple");
    setLoginError(null);

    if (!isNative) {
      signIn("apple", { callbackUrl: "/home/" });
      return;
    }

    try {
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");

      const signInPromise = FirebaseAuthentication.signInWithApple();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT after 30s")), 30000)
      );
      await Promise.race([signInPromise, timeoutPromise]);

      const tokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
      const idToken = tokenResult.token;
      if (!idToken) throw new Error("Failed to get Firebase ID token");

      const sessionRes = await fetch("https://www.lattice-protocol.com/api/auth/native-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        throw new Error(`認証サーバエラー (${sessionRes.status})`);
      }

      const data = await sessionRes.json();
      if (data.sessionToken) {
        const { saveNativeSession } = await import("@/lib/native-fetch");
        await saveNativeSession(data.sessionToken);
      }

      await new Promise((r) => setTimeout(r, 150));
      router.replace("/home/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[login] apple native failed", msg);
      setLoginError("ログインに失敗しました。もう一度お試しください。");
      setLoading(null);
    }
  };

  const btnBase = {
    width: "100%",
    padding: "13px 20px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 500 as const,
    cursor: "pointer",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    fontFamily: "inherit",
    transition: "all 0.15s",
    border: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px)",
        background: "var(--bg)",
        transition: "background .25s",
        overflow: "hidden",
        overscrollBehavior: "none",
        WebkitOverflowScrolling: "auto",
        touchAction: "none",
      } as React.CSSProperties}
    >
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-display)",
            margin: "0 0 8px",
            letterSpacing: "0.08em",
          }}
        >
          LATTICE
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
          アカウントにサインインして始めましょう
        </p>
      </div>

      {(ref || refSaved) && (
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            background: "var(--surface)",
            border: "1px solid var(--success)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--success)", fontWeight: 600, margin: "0 0 1px" }}>
            招待されました!
          </p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
            ログインすると10クレジットがボーナスでもらえます
          </p>
        </div>
      )}

      {loginError && (
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            background: "var(--surface)",
            border: "1px solid var(--accent)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--accent)", margin: 0 }}>{loginError}</p>
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          onClick={handleAppleLogin}
          disabled={loading !== null}
          style={{
            ...btnBase,
            background: "#fff",
            color: "#000",
            border: "1px solid #3a3a3c",
            opacity: loading && loading !== "apple" ? 0.5 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {loading === "apple" ? "接続中..." : "Appleでログイン"}
        </button>

        <button
          onClick={handleGoogleLogin}
          disabled={loading !== null}
          style={{
            ...btnBase,
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-visible)",
            opacity: loading && loading !== "google" ? 0.5 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {loading === "google" ? "接続中..." : "Googleでログイン"}
        </button>
      </div>

      <p
        style={{
          color: "var(--text-disabled)",
          fontSize: 11,
          marginTop: 20,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        ログインすることで
        <a href="/terms/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
          利用規約
        </a>
        ・
        <a href="/privacy/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
          プライバシーポリシー
        </a>
        に同意したものとみなします
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
