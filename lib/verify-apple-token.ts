import { jwtVerify, createRemoteJWKSet } from "jose";

const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

export interface AppleIdTokenPayload {
  sub: string;
  email?: string;
  aud: string;
  iss: string;
}

export async function verifyAppleIdToken(
  idToken: string
): Promise<AppleIdTokenPayload | null> {
  try {
    const bundleId = "com.lattice.protocol";
    const serviceId = process.env.APPLE_CLIENT_ID;
    const allowedAudiences = [bundleId, serviceId].filter(
      (v): v is string => !!v
    );

    console.log("[verify-apple-token] allowedAudiences:", allowedAudiences);
    const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
      issuer: "https://appleid.apple.com",
      audience: allowedAudiences,
    });

    console.log("[verify-apple-token] success, sub:", payload.sub, "email:", payload.email);
    return payload as unknown as AppleIdTokenPayload;
  } catch (e) {
    console.error("[verify-apple-token] failed:", e);
    return null;
  }
}
