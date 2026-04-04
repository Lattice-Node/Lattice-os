/**
 * Apple Client Secret Generator for NextAuth
 * 
 * 使い方:
 *   node scripts/generate-apple-secret.mjs path/to/AuthKey_JBBKY8HM98.p8
 *
 * 必要情報 (Apple Developer Console から):
 *   Team ID:     29M664BMA3
 *   Key ID:      JBBKY8HM98
 *   Services ID: com.lattice-node.lattice.web
 *
 * 生成されたsecretをVercelの環境変数 APPLE_CLIENT_SECRET に設定してください
 * 有効期限: 180日（約6ヶ月）
 */

import { readFileSync } from "fs";
import { createPrivateKey, createSign } from "crypto";

const TEAM_ID = "29M664BMA3";
const KEY_ID = "JBBKY8HM98";
const CLIENT_ID = "com.lattice-node.lattice.web";
const EXPIRY_DAYS = 180;

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("使い方: node scripts/generate-apple-secret.mjs <path-to-.p8-file>");
  console.error("例:     node scripts/generate-apple-secret.mjs ~/AuthKey_JBBKY8HM98.p8");
  process.exit(1);
}

function base64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

const now = Math.floor(Date.now() / 1000);
const exp = now + EXPIRY_DAYS * 24 * 60 * 60;

const header = { alg: "ES256", kid: KEY_ID, typ: "JWT" };
const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: exp,
  aud: "https://appleid.apple.com",
  sub: CLIENT_ID,
};

const headerB64 = base64url(JSON.stringify(header));
const payloadB64 = base64url(JSON.stringify(payload));
const signingInput = `${headerB64}.${payloadB64}`;

const keyPem = readFileSync(keyPath, "utf8");
const privateKey = createPrivateKey({ key: keyPem, format: "pem" });
const sign = createSign("SHA256");
sign.update(signingInput);
const sig = sign.sign({ key: privateKey, dsaEncoding: "ieee-p1363" });
const sigB64 = base64url(sig);

const jwt = `${signingInput}.${sigB64}`;

console.log("=== Apple Client Secret (JWT) ===");
console.log(jwt);
console.log("");
console.log(`有効期限: ${new Date(exp * 1000).toISOString().slice(0, 10)}`);
console.log(`(${EXPIRY_DAYS}日間有効)`);
console.log("");
console.log("次のステップ:");
console.log("1. Vercel Dashboard → Settings → Environment Variables");
console.log("2. APPLE_CLIENT_SECRET の値を上記JWTに更新");
console.log("3. Redeploy");
