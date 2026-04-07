const fs = require("fs");
const path = require("path");

// Patterns to replace (only in client UI files, not API routes)
const replacements = [
  // /node/${id}/talk → /node/talk/?id=${id}
  { from: /\/node\/\$\{([^}]+)\}\/talk\b/g, to: "/node/talk/?id=${$1}" },
  { from: /\/node\/\$\{([^}]+)\}\/memories\b/g, to: "/node/memories/?id=${$1}" },
  { from: /\/node\/\$\{([^}]+)\}\/diaries\b/g, to: "/node/diaries/?id=${$1}" },
  { from: /\/node\/\$\{([^}]+)\}(?!\/|\?)/g, to: "/node/detail/?id=${$1}" },
  { from: /\/agents\/\$\{([^}]+)\}(?!\/|\?)/g, to: "/agents/detail/?id=${$1}" },
];

const targets = [
  "app/node/NodeClient.tsx",
  "app/node/[id]/NodeDetailClient.tsx",
  "app/agents/AgentsList.tsx",
  "app/agents/new/NewAgentClient.tsx",
  "app/store/StoreList.tsx",
  "app/home/HomeClient.tsx",
  "app/inbox/InboxList.tsx",
  "components/BottomNav.tsx",
  "components/PushNotificationSetup.tsx",
];

for (const t of targets) {
  if (!fs.existsSync(t)) continue;
  let s = fs.readFileSync(t, "utf8");
  const orig = s;
  for (const { from, to } of replacements) {
    s = s.replace(from, to);
  }
  if (s !== orig) {
    fs.writeFileSync(t, s);
    console.log("UPDATED:", t);
  }
}
