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

    // Resilient user resolution: existing user → SELECT only, new user → minimal INSERT.
    // This avoids the case where Prisma's auto-generated INSERT references columns that
    // don't yet exist in the production DB (e.g. monthlyRunsUsed before migration runs).
    let dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });
    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: { email, name: decoded.name ?? "" },
          select: { id: true, email: true, name: true },
        });
      } catch (createErr) {
        // Fallback: raw SQL insert with minimal columns. Survives a schema/db drift.
        const fallbackName = (decoded.name ?? "").replace(/'/g, "''");
        const fallbackEmail = email.replace(/'/g, "''");
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "User" (id, email, name) VALUES (gen_random_uuid()::text, '${fallbackEmail}', '${fallbackName}') ON CONFLICT (email) DO NOTHING`
          );
          dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true },
          });
        } catch (rawErr) {
          console.error("[native-session] both Prisma create and raw insert failed", { createErr, rawErr });
          throw createErr;
        }
        if (!dbUser) {
          console.error("[native-session] raw insert succeeded but user lookup failed");
          throw createErr;
        }
      }
    }

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
