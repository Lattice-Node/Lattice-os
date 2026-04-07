const fs = require("fs");
const path = require("path");

// Top-level routes that need trailing slashes for static export
const ROUTES = [
  "home", "node", "agents", "inbox", "settings", "login", "onboarding",
  "store", "news", "pricing", "privacy", "terms",
];

// Sub-routes (must come before top-level to avoid double-matching)
const SUB_ROUTES = [
  "agents/new", "agents/detail", "node/new", "node/detail",
  "node/talk", "node/memories", "node/diaries", "node/chat",
];

const ALL = [...SUB_ROUTES, ...ROUTES];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let s = fs.readFileSync(filePath, "utf8");
  const orig = s;

  for (const route of ALL) {
    // router.push("/foo") → router.push("/foo/")
    // router.replace("/foo") → router.replace("/foo/")
    // href="/foo" → href="/foo/"
    // Match path that ends without slash, query, or template-string interpolation
    const escaped = route.replace(/\//g, "\\/");
    const re = new RegExp(`(["'\`])\\/${escaped}(?=\\1)`, "g");
    s = s.replace(re, `$1/${route}/`);
  }

  if (s === orig) return false;
  fs.writeFileSync(filePath, s);
  return true;
}

function walk(dir) {
  const updated = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    if (!fs.existsSync(cur)) continue;
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        stack.push(full);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        if (processFile(full)) updated.push(full);
      }
    }
  }
  return updated;
}

const updated = [...walk("app"), ...walk("components")];
console.log(`Updated ${updated.length} files:`);
updated.forEach(f => console.log("  " + f));
