import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StoreList from "./StoreList";

export default async function StorePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const templates = await prisma.agentTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="page">
      <p className="page-label">エージェントストア</p>
      <h1 className="page-title">エージェントを探す</h1>
      <StoreList templates={JSON.parse(JSON.stringify(templates))} />
    </div>
  );
}