import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

if (!getApps().length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
}

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_NAME = isProduction ? "__Secure-authjs.session-token" : "authjs.session-token";
const MAX_AGE = 30 * 24 * 60 * 60;

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return jsonWithCors(req, { error: "No idToken" }, { status: 400 });
    }

    const decoded = await getAuth().verifyIdToken(idToken);
    console.log("[native-session] verified:", decoded.email, decoded.firebase?.sign_in_provider);

    const email = decoded.email;
    if (!email) {
      return jsonWithCors(req, { error: "No email in token" }, { status: 401 });
    }

    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: decoded.name ?? "" },
    });

    const token = await encode({
      token: {
        sub: dbUser.id,
        userId: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: decoded.picture ?? null,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      salt: COOKIE_NAME,
      maxAge: MAX_AGE,
    });

    const res = jsonWithCors(req, {
      ok: true,
      sessionToken: token,
      user: { id: dbUser.id, email: dbUser.email, name: dbUser.name },
    });

    res.headers.append(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=None; Max-Age=${MAX_AGE}`
    );

    return res;
  } catch (e) {
    console.error("[native-session] failed:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    // Use 500 for server-side issues (e.g. DB schema drift) so the client knows it's not auth
    const isAuthError = /token|verify|aud|signature/i.test(msg);
    return jsonWithCors(req, { error: msg }, { status: isAuthError ? 401 : 500 });
  }
}
