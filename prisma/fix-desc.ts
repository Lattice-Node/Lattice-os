import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const agents = await prisma.userAgent.findMany();
  for (const a of agents) {
    let d = a.description;
    d = d.replace("にに", "に");
    d = d.replace("にで", "で");
    d = d.replace("  ", " ");
    if (d !== a.description) {
      await prisma.userAgent.update({ where: { id: a.id }, data: { description: d } });
      console.log("Fixed: " + a.name + " -> " + d);
    }
  }
  console.log("Done");
}
main().catch(console.error).finally(() => prisma.$disconnect());