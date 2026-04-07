const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Capacitor build excludes:
// - app/api/** (no API routes in static export — Vercel hosts these)
// - app/agents/[id]/** (dynamic, replaced with /agents/detail)
// - app/node/[id]/** (dynamic, replaced with /node/detail)
// - middleware.ts (Edge runtime not supported in static export)
// - app/admin/** (uses next/headers / cookies for auth)
// Also: /api/auth/[...nextauth] depends on lib/auth which uses Node-only deps
const toExclude = [
  { live: "app/api", backup: ".capacitor-backup/app/api" },
  { live: "app/agents/[id]", backup: ".capacitor-backup/app/agents/__id__" },
  { live: "app/node/[id]", backup: ".capacitor-backup/app/node/__id__" },
  { live: "middleware.ts", backup: ".capacitor-backup/middleware.ts" },
  { live: "app/admin", backup: ".capacitor-backup/app/admin" },
  { live: "app/sitemap.ts", backup: ".capacitor-backup/app/sitemap.ts" },
];

function moveAside() {
  for (const { live, backup } of toExclude) {
    if (fs.existsSync(live)) {
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.renameSync(live, backup);
      console.log(`[capacitor-build] moved aside: ${live}`);
    }
  }
}

function restore() {
  for (const { live, backup } of toExclude) {
    if (fs.existsSync(backup)) {
      fs.mkdirSync(path.dirname(live), { recursive: true });
      fs.renameSync(backup, live);
      console.log(`[capacitor-build] restored: ${live}`);
    }
  }
  if (fs.existsSync(".capacitor-backup")) {
    try {
      fs.rmSync(".capacitor-backup", { recursive: true, force: true });
    } catch {}
  }
}

let buildError = null;
try {
  moveAside();
  execSync("cross-env CAPACITOR_BUILD=true next build", { stdio: "inherit" });
} catch (e) {
  buildError = e;
} finally {
  restore();
}

if (buildError) {
  console.error("[capacitor-build] build failed");
  process.exit(1);
}
