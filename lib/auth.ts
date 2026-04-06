import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { sendLoginNotificationEmail } from "@/lib/mailer";

const providers: Provider[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "select_account",
      },
    },
  }),
  Credentials({
    id: "native",
    name: "Native Firebase",
    credentials: {
      idToken: { label: "ID Token", type: "text" },
    },
    async authorize(credentials) {
      const idToken = credentials?.idToken as string | undefined;
      if (!idToken) {
        console.error("[native-auth] No idToken provided");
        return null;
      }

      try {
        const baseUrl = process.env.NEXTAUTH_URL || "https://www.lattice-protocol.com";
        const res = await fetch(`${baseUrl}/api/auth/verify-native`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!res.ok) {
          console.error("[native-auth] verify-native API failed:", res.status);
          return null;
        }

        const decoded = await res.json();
        if (!decoded.email) {
          console.error("[native-auth] No email in decoded token");
          return null;
        }

        return {
          id: decoded.uid,
          email: decoded.email,
          name: decoded.name ?? null,
          image: decoded.picture ?? null,
        };
      } catch (error) {
        console.error("[native-auth] verifyIdToken failed:", error);
        return null;
      }
    },
  }),
];

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.email && account) {
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: { email: user.email, name: user.name ?? "" },
        });
        token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      const userId = token.userId as string | undefined;
      if (session.user && userId) {
        session.user.id = userId;
      }
      if (userId) {
        try {
          const { prisma } = await import("@/lib/prisma");
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { onboardingCompleted: true },
          });
          (session as any).onboardingCompleted = user?.onboardingCompleted ?? false;
        } catch {
          (session as any).onboardingCompleted = true;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (user.email) {
          const now = new Date().toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          await sendLoginNotificationEmail({
            to: user.email,
            userName: user.name ?? user.email,
            loginAt: now,
            ipAddress: "Lattice経由",
          });
        }
      } catch (e) {
        console.error("Login notification email failed:", e);
      }
      return true;
    },
  },
});
