import { auth } from "./auth";
import { authFromBearer } from "./auth-bearer";

export interface AuthResult {
  userId: string;
  email: string | null;
}

export async function authAny(req: Request): Promise<AuthResult | null> {
  // Try cookie-based first (web)
  try {
    const session = await auth();
    if (session?.user?.id) {
      return { userId: session.user.id, email: session.user.email ?? null };
    }
  } catch (e) {
    console.warn("[auth-any] cookie auth failed:", e);
  }

  // Fall back to bearer token (native)
  const decoded = await authFromBearer(req);
  if (decoded?.userId) {
    return {
      userId: decoded.userId as string,
      email: (decoded.email as string) ?? null,
    };
  }

  return null;
}
