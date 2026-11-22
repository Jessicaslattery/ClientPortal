import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// Dev-only: creates a mock SMS client for previewing the social strategy portal
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const hash = await bcrypt.hash("sms123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@smsportal.test" },
    update: { password: hash },
    create: {
      email: "demo@smsportal.test",
      name: "Sophie Clarke",
      password: hash,
      role: "client",
    },
  });

  // Ensure ClientProfile exists with sms package
  const existing = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
  if (!existing) {
    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        businessName: "Bloom Wellness Co.",
        founderName: "Sophie Clarke",
        email: "demo@smsportal.test",
        package: "sms",
      },
    });
  } else {
    await prisma.clientProfile.update({
      where: { id: existing.id },
      data: { package: "sms" },
    });
  }

  return NextResponse.json({
    created: true,
    login: { email: "demo@smsportal.test", password: "sms123" },
    note: "Log in at /login then visit /social/posts",
  });
}
