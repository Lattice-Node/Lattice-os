const fs = require("fs");
const path = require("path");

const targets = [
  "app/onboarding/OnboardingClient.tsx",
  "app/home/HomeClient.tsx",
  "app/settings/SettingsClient.tsx",
  "app/settings/ProfileEdit.tsx",
  "app/agents/[id]/page.tsx",
  "app/agents/detail/page.tsx",
  "app/agents/new/NewAgentClient.tsx",
  "app/agents/AgentsList.tsx",
  "app/store/StoreList.tsx",
  "app/node/[id]/talk/TalkClient.tsx",
  "app/node/talk/TalkClient.tsx",
  "app/node/new/NewNodeClient.tsx",
  "app/node/[id]/diaries/page.tsx",
  "app/node/[id]/memories/page.tsx",
  "app/news/NewsClient.tsx",
  "components/PushNotificationSetup.tsx",
  "components/BottomNav.tsx",
];

for (const t of targets) {
  if (!fs.existsSync(t)) {
    console.log("SKIP (missing):", t);
    continue;
  }
  let s = fs.readFileSync(t, "utf8");
  const orig = s;

  // Replace fetch("/api/...") and fetch(`/api/...`) with nativeFetch
  s = s.replace(/(?<![A-Za-z_$.])fetch\((["'`])\/api\//g, "nativeFetch($1/api/");

  if (s === orig) {
    console.log("NO CHANGE:", t);
    continue;
  }

  // Add import if missing
  if (!/from\s+["']@\/lib\/native-fetch["']/.test(s)) {
    // Insert after the last import
    const importMatches = [...s.matchAll(/^import .*?;$/gm)];
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertAt = lastImport.index + lastImport[0].length;
      s = s.slice(0, insertAt) + '\nimport { nativeFetch } from "@/lib/native-fetch";' + s.slice(insertAt);
    } else {
      s = 'import { nativeFetch } from "@/lib/native-fetch";\n' + s;
    }
  }

  fs.writeFileSync(t, s);
  console.log("UPDATED:", t);
}
