import { jwtVerify, createRemoteJWKSet } from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export interface GoogleIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  aud: string;
  iss: string;
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleIdTokenPayload | null> {
  try {
    const iosClientId = process.env.GOOGLE_IOS_CLIENT_ID;
    const webClientId = process.env.GOOGLE_CLIENT_ID;
    if (!iosClientId && !webClientId) {
      console.error("[verify-google-token] no client id configured");
      return null;
    }
    const allowedAudiences = [iosClientId, webClientId].filter(
      (v): v is string => !!v
    );

    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: allowedAudiences,
    });

    return payload as unknown as GoogleIdTokenPayload;
  } catch (e) {
    console.error("[verify-google-token] failed", e);
    return null;
  }
}
