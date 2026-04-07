const fs = require("fs");

const targets = [
  "app/api/agents/route.ts",
  "app/api/agents/[id]/route.ts",
  "app/api/agents/[id]/logs/route.ts",
  "app/api/execute/route.ts",
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
  if (!fs.existsSync(t)) continue;
  let s = fs.readFileSync(t, "utf8");
  const orig = s;

  // Fix duplicate auth import (e.g. push/register has auth from @/lib/auth still)
  s = s.replace(/import \{ auth \} from ['"]@\/lib\/auth['"];?\n/g, "");
  s = s.replace(/import \{ auth \} from ['"]@\/auth['"];?\n/g, "");

  // Make sure authAny is imported
  if (s.includes("authAny(") && !s.includes('from "@/lib/auth-any"')) {
    s = `import { authAny } from "@/lib/auth-any";\n` + s;
  }

  // Fix function signatures: GET() → GET(req: Request) when authAny(req) is called
  s = s.replace(/export async function GET\(\)\s*\{/g, "export async function GET(req: Request) {");
  s = s.replace(/export async function POST\(\)\s*\{/g, "export async function POST(req: Request) {");
  s = s.replace(/export async function DELETE\(\)\s*\{/g, "export async function DELETE(req: Request) {");
  s = s.replace(/export async function PATCH\(\)\s*\{/g, "export async function PATCH(req: Request) {");

  // For routes using NextRequest/request, alias to req
  s = s.replace(/export async function POST\(request: NextRequest\)\s*\{/g, "export async function POST(req: NextRequest) {\n  const request = req;");
  s = s.replace(/export async function DELETE\(request: NextRequest\)\s*\{/g, "export async function DELETE(req: NextRequest) {\n  const request = req;");
  s = s.replace(/export async function GET\(request: NextRequest\)\s*\{/g, "export async function GET(req: NextRequest) {\n  const request = req;");

  if (s !== orig) {
    fs.writeFileSync(t, s);
    console.log("FIXED:", t);
  }
}
