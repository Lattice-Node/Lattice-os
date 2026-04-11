/**
 * Lattice app registry — static definitions of all built-in apps.
 * Future: marketplace apps will be fetched from DB and merged.
 */

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;  // SVG path data for a 24x24 viewBox
  route: string;
  color: string;  // kept for backward compat
  color1: string; // gradient start
  color2: string; // gradient end
  description?: string;
}

// Icon paths (24x24 viewBox, stroke-based)
const ICONS = {
  network: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 8a4 4 0 100 8 4 4 0 000-8z",
  bot: "M12 2a2 2 0 012 2v1h3a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2zM9 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9 16h6",
  check: "M4 12l5 5L20 7",
  store: "M3 3h18v4H3zM5 7v12a1 1 0 001 1h12a1 1 0 001-1V7M10 12h4",
  history: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2",
  card: "M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM3 10h18",
  userPlus: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM20 8v6M23 11h-6",
  message: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  inbox: "M4 6h16M4 12h16M4 18h10",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33",
};

export const APPS_REGISTRY: AppDefinition[] = [
  { id: "node",     name: "ノード",       icon: ICONS.network,  route: "/node/",      color: "#3b82f6", color1: "#3b82f6", color2: "#1d4ed8" },
  { id: "myagent",  name: "マイAgent",    icon: ICONS.bot,      route: "/agents/",    color: "#a855f7", color1: "#a855f7", color2: "#6b21a8" },
  { id: "tasks",    name: "タスク",       icon: ICONS.check,    route: "/home/#tasks", color: "#10b981", color1: "#10b981", color2: "#047857" },
  { id: "store",    name: "ストア",       icon: ICONS.store,    route: "/store/",     color: "#f59e0b", color1: "#f59e0b", color2: "#d97706" },
  { id: "inbox",    name: "受信箱",       icon: ICONS.inbox,    route: "/inbox/",     color: "#6366f1", color1: "#6366f1", color2: "#4338ca" },
  { id: "history",  name: "履歴",         icon: ICONS.history,  route: "/inbox/",     color: "#64748b", color1: "#64748b", color2: "#334155" },
  { id: "plan",     name: "プラン",       icon: ICONS.card,     route: "/settings/",  color: "#ec4899", color1: "#ec4899", color2: "#be185d" },
  { id: "settings", name: "設定",         icon: ICONS.settings, route: "/settings/",  color: "#94a3b8", color1: "#94a3b8", color2: "#475569" },
];

export const DEFAULT_LAYOUT = APPS_REGISTRY.map((app, i) => ({
  id: app.id,
  position: i,
}));
