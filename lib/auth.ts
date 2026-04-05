import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import type { Provider } from "next-auth/providers";
import { sendLoginNotificationEmail } from "@/lib/mailer";

const providers: Provider[] = [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "select_account",
      },
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
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (token.sub) {
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { onboardingCompleted: true },
        });
        (session as any).onboardingCompleted = user?.onboardingCompleted ?? false;
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
