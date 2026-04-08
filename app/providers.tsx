"use client";
import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  // On native (Capacitor), disable SessionProvider auto-fetch — it would call
  // capacitor://localhost/api/auth/session which 404s and breaks JSON parsing.
  // Pass session={null} + refetchInterval={0} to fully disable network calls.
  return (
    <SessionProvider session={null} refetchInterval={0} refetchOnWindowFocus={false}>
      <AppProvider>{children}</AppProvider>
    </SessionProvider>
  );
}
