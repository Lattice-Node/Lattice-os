import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";
import { APPS_REGISTRY, DEFAULT_LAYOUT } from "@/lib/apps-registry";

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

  const appEntries = layout.apps as Array<{ id: string; position: number }>;
  const hiddenIds = layout.hiddenApps as string[];

  const visible = appEntries
    .map((entry) => {
      const def = APPS_REGISTRY.find((a) => a.id === entry.id);
      return def ? { ...def, position: entry.position } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.position - b!.position);

  const available = APPS_REGISTRY.filter((a) => hiddenIds.includes(a.id));

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
