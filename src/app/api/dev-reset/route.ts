import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// Temporary dev-only route — remove after use
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const hash = await bcrypt.hash("PivotCo2024!", 10);

  // Ensure founder account exists
  await prisma.user.upsert({
    where: { email: "founder@pivotco.com.au" },
    update: { password: hash },
    create: {
      email: "founder@pivotco.com.au",
      name: "Jess",
      password: hash,
      role: "founder",
    },
  });

  const updated = await prisma.user.updateMany({
    where: {},
    data: { password: hash },
  });

  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true },
    orderBy: { role: "asc" },
  });

  return NextResponse.json({ updated: updated.count, users, founderLogin: { email: "founder@pivotco.com.au", password: "PivotCo2024!" } });
}
