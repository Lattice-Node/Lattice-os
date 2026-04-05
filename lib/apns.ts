// lib/apns.ts
import { SignJWT, importPKCS8 } from 'jose';

const APNS_HOST_PRODUCTION = 'https://api.push.apple.com';
const APNS_HOST_SANDBOX = 'https://api.sandbox.push.apple.com';

let cachedToken: { jwt: string; expiresAt: number } | null = null;

async function getApnsJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 600) {
    return cachedToken.jwt;
  }

  const keyId = process.env.APNS_KEY_ID!;
  const teamId = process.env.APNS_TEAM_ID!;
  const keyP8 = process.env.APNS_KEY_P8!;
  const keyContent = keyP8.replace(/\\n/g, '\n');

  const privateKey = await importPKCS8(keyContent, 'ES256');

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .sign(privateKey);

  cachedToken = { jwt, expiresAt: now + 3600 };
  return jwt;
}

function getApnsHost(): string {
  return process.env.APNS_ENVIRONMENT === 'production'
    ? APNS_HOST_PRODUCTION
    : APNS_HOST_SANDBOX;
}

export interface ApnsPushPayload {
  title: string;
  body: string;
  badge?: number;
  sound?: string;
  data?: Record<string, string>;
}

export interface ApnsSendResult {
  success: boolean;
  deviceToken: string;
  statusCode?: number;
  reason?: string;
}

export async function sendPushNotification(
  deviceToken: string,
  payload: ApnsPushPayload
): Promise<ApnsSendResult> {
  try {
    const jwt = await getApnsJwt();
    const host = getApnsHost();
    const bundleId = process.env.APNS_BUNDLE_ID || 'com.lattice.protocol';

    const apnsPayload = {
      aps: {
        alert: { title: payload.title, body: payload.body },
        badge: payload.badge ?? 1,
        sound: payload.sound ?? 'default',
        'mutable-content': 1,
      },
      ...payload.data,
    };

    const response = await fetch(`${host}/3/device/${deviceToken}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'apns-expiration': '0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apnsPayload),
    });

    if (response.status === 200) {
      return { success: true, deviceToken, statusCode: 200 };
    }

    const errorBody = await response.json().catch(() => ({}));
    return {
      success: false,
      deviceToken,
      statusCode: response.status,
      reason: (errorBody as { reason?: string }).reason || `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      deviceToken,
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendPushToMultipleDevices(
  deviceTokens: string[],
  payload: ApnsPushPayload
): Promise<ApnsSendResult[]> {
  const results = await Promise.allSettled(
    deviceTokens.map((token) => sendPushNotification(token, payload))
  );
  return results.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    return {
      success: false,
      deviceToken: deviceTokens[index],
      reason: result.reason?.message || 'Promise rejected',
    };
  });
}