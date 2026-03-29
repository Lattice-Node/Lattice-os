import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { OAuthConfig } from "next-auth/providers";

const LINE: OAuthConfig<any> = {
  id: "line",
  name: "LINE",
  type: "oauth",
  authorization: {
    url: "https://access.line.me/oauth2/v2.1/authorize",
    params: { scope: "profile openid email", bot_prompt: "normal" },
  },
  token: "https://api.line.me/oauth2/v2.1/token",
  userinfo: "https://api.line.me/v2/profile",
  clientId: process.env.LINE_CHANNEL_ID!,
  clientSecret: process.env.LINE_CHANNEL_SECRET!,
  profile(profile) {
    return {
      id: profile.userId,
      name: profile.displayName,
      email: null,
      image: profile.pictureUrl,
    };
  },
};
import { sendLoginNotificationEmail } from "@/lib/mailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    LINE,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
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