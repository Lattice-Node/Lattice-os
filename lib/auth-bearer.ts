import { decode } from "next-auth/jwt";

export async function authFromBearer(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
    });
    return decoded;
  } catch (e) {
    console.warn("[auth-bearer] decode failed:", e);
    return null;
  }
}
