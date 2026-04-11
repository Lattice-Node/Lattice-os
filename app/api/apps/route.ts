import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";
import { APPS_REGISTRY, DEFAULT_LAYOUT, type AppDefinition } from "@/lib/apps-registry";

async function getRegistryWithOverrides(): Promise<AppDefinition[]> {
  try {
    const overrides = await prisma.appOverride.findMany();
    const map = new Map(overrides.map((o) => [o.appId, o]));
    return APPS_REGISTRY.map((app) => {
      const ov = map.get(app.id);
      if (!ov) return app;
      return {
        ...app,
        name: ov.name ?? app.name,
        icon: ov.iconName ?? app.icon,
        iconImageUrl: ov.iconImageUrl ?? null,
        color1: ov.color1 ?? app.color1,
        color2: ov.color2 ?? app.color2,
      };
    });
  } catch {
    return APPS_REGISTRY;
  }
}

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  let layout = await prisma.userAppLayout.findUnique({
    where: { userId: session.userId },
  });

  if (!layout) {
    layout = await prisma.userAppLayout.create({
      data: {
        userId: session.userId,
        apps: DEFAULT_LAYOUT,
        hiddenApps: [],
      },
    });
  }

  const registry = await getRegistryWithOverrides();
  const appEntries = layout.apps as Array<{ id: string; position: number }>;
  const hiddenIds = layout.hiddenApps as string[];

  // Auto-append new registry apps that aren't in layout or hidden
  const knownIds = new Set([...appEntries.map((a) => a.id), ...hiddenIds]);
  const newAppIds = registry.map((a) => a.id).filter((id) => !knownIds.has(id));
  if (newAppIds.length > 0) {
    const maxPos = appEntries.length > 0 ? Math.max(...appEntries.map((a) => a.position)) : -1;
    const newEntries = newAppIds.map((id, i) => ({ id, position: maxPos + 1 + i }));
    appEntries.push(...newEntries);
    await prisma.userAppLayout.update({
      where: { userId: session.userId },
      data: { apps: appEntries },
    });
  }

  const visible = appEntries
    .map((entry) => {
      const def = registry.find((a) => a.id === entry.id);
      return def ? { ...def, position: entry.position } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.position - b!.position);

  const available = registry.filter((a) => hiddenIds.includes(a.id));

  return jsonWithCors(req, { visible, available });
}

export async function PUT(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { apps, hiddenApps } = body;

  if (!Array.isArray(apps) || !Array.isArray(hiddenApps)) {
    return jsonWithCors(req, { error: "Invalid body" }, { status: 400 });
  }

  await prisma.userAppLayout.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      apps,
      hiddenApps,
    },
    update: {
      apps,
      hiddenApps,
    },
  });

  return jsonWithCors(req, { ok: true });
}
