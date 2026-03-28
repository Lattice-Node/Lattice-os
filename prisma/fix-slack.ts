import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const agents = await prisma.userAgent.findMany();
  for (const a of agents) {
    let desc = a.description;
    let changed = false;
    if (desc.includes("Slack")) {
      desc = desc.replace(/Slack/g, "").replace(/\s+/g, " ").trim();
      changed = true;
    }
    if (changed) {
      await prisma.userAgent.update({
        where: { id: a.id },
        data: { description: desc },
      });
      console.log("Fixed: " + a.name);
    }
  }
  console.log("Done");
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());