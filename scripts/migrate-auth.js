// Migrate auth() → authAny(req) and add CORS in API routes
const fs = require("fs");
const path = require("path");

const targets = [
  "app/api/agents/route.ts",
  "app/api/agents/[id]/route.ts",
  "app/api/agents/[id]/logs/route.ts",
  "app/api/execute/route.ts",
  "app/api/node/[id]/route.ts",
  "app/api/node/[id]/exchange/route.ts",
  "app/api/node/[id]/history/route.ts",
  "app/api/node/[id]/latest/route.ts",
  "app/api/node/[id]/memories/route.ts",
  "app/api/node/[id]/diaries/route.ts",
  "app/api/onboarding/complete/route.ts",
  "app/api/profile/route.ts",
  "app/api/referral/route.ts",
  "app/api/tasks/route.ts",
  "app/api/users/delete/route.ts",
  "app/api/connections/route.ts",
  "app/api/push/register/route.ts",
];

for (const t of targets) {
  if (!fs.existsSync(t)) {
    console.log("SKIP missing:", t);
    continue;
  }
  let s = fs.readFileSync(t, "utf8");
  const orig = s;

  // import auth → authAny
  if (s.includes('from "@/lib/auth"') && s.includes("import { auth }")) {
    s = s.replace(/import \{ auth \} from ["']@\/lib\/auth["'];?/g, 'import { authAny } from "@/lib/auth-any";');
  } else if (s.includes('from "@/auth"') && s.includes("import { auth }")) {
    s = s.replace(/import \{ auth \} from ["']@\/auth["'];?/g, 'import { authAny } from "@/lib/auth-any";');
  }

  // const session = await auth() → const session = await authAny(req)
  s = s.replace(/const session = await auth\(\);/g, "const session = await authAny(req);");

  // session?.user?.id → session?.userId
  s = s.replace(/session\?\.user\?\.id/g, "session?.userId");
  s = s.replace(/session!\.user!\.id/g, "session!.userId");
  s = s.replace(/session\.user\.id/g, "session.userId");

  // session?.user?.email → session?.email
  s = s.replace(/session\?\.user\?\.email/g, "session?.email");
  s = s.replace(/session!\.user!\.email/g, "session!.email");
  s = s.replace(/session\.user\.email/g, "session.email");

  if (s !== orig) {
    fs.writeFileSync(t, s);
    console.log("MIGRATED:", t);
  } else {
    console.log("NOOP:", t);
  }
}
