import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("pivot2024", 10);
  await prisma.user.update({ where: { email: "founder@pivotco.com.au" }, data: { password: hash } });
  console.log("Done — founder password set to: pivot2024");
}

main().catch(console.error).finally(() => prisma.$disconnect());
