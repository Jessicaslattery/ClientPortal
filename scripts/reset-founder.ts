import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  await prisma.user.deleteMany({ where: { role: "founder" } });

  const hash = await bcrypt.hash("CamMitchell", 10);
  await prisma.user.create({
    data: {
      email: "jess@pivotco.com.au",
      name: "Jess",
      password: hash,
      role: "founder",
    },
  });

  console.log("✓ Founder account created");
  console.log("  Email:    jess@pivotco.com.au");
  console.log("  Password: CamMitchell");
}

main().catch(console.error).finally(() => prisma.$disconnect());
