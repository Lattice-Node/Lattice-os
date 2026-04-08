import { prisma } from "@/lib/prisma";
import { authAny } from "@/lib/auth-any";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (user?.role !== "admin") return new Response("Forbidden", { status: 403 });

  // Optional ?year=2026
  const url = new URL(req.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const records = await prisma.revenueRecord.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  });

  const userIds = Array.from(new Set(records.map((r) => r.userId).filter(Boolean) as string[]));
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u.email]));

  const header = ["date", "amount_jpy", "platform", "product_id", "transaction_type", "user_id", "user_email", "external_id"];
  const rows = records.map((r) => [
    new Date(r.date).toISOString().slice(0, 10),
    String(r.amount),
    r.platform,
    r.productId,
    r.transactionType,
    r.userId || "",
    (r.userId && userMap.get(r.userId)) || "",
    r.externalId || "",
  ].map(csvEscape).join(","));

  const totalRow = `,,,,TOTAL,,,${csvEscape(records.reduce((s, r) => s + r.amount, 0))}`;
  const csv = [header.join(","), ...rows, totalRow].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lattice-revenue-${year}.csv"`,
    },
  });
}
