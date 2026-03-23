import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { sendLoginNotificationEmail } from "@/lib/mailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
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