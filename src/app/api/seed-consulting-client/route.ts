import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// Dev-only: creates a mock consulting client for previewing the main client portal
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const hash = await bcrypt.hash("consult123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@consultportal.test" },
    update: { password: hash },
    create: {
      email: "demo@consultportal.test",
      name: "Alex Rivera",
      password: hash,
      role: "client",
    },
  });

  const existing = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
  if (!existing) {
    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        businessName: "Rivera & Co.",
        founderName: "Alex Rivera",
        email: "demo@consultportal.test",
        package: "consulting",
        onboardingComplete: true,
        tier: "GROWTH",
        currentMonth: 3,
        currentWeek: 2,
        currentPhase: "BUILD",
        primaryPlatform: "Instagram",
        platforms: "Instagram,LinkedIn",
      },
    });
  } else {
    await prisma.clientProfile.update({
      where: { id: existing.id },
      data: {
        package: "consulting",
        onboardingComplete: true,
      },
    });
  }

  return NextResponse.json({
    created: true,
    login: { email: "demo@consultportal.test", password: "consult123" },
    note: "Log in at /login then visit /home",
  });
}
