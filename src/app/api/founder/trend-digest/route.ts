import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  await requireAuth("founder");

  const latest = await prisma.agentOutput.findFirst({
    where: { type: "trend_digest", clientProfileId: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(latest ?? null);
}
