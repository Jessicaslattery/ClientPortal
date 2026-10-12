/**
 * 1st of every month at 7am AEST (UTC+10 = 21:00 UTC previous day, so schedule: 0 21 28-31 * *)
 * Locks in the start-of-month progress baseline for every active goal across all clients.
 * Must run before the progress report cron.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const month = getCurrentMonth();

  const activeGoals = await prisma.goal.findMany({
    where: { status: "active" },
    select: { id: true, clientProfileId: true, progressPercent: true },
  });

  // Skip goals that already have a snapshot for this month
  const existingSnapshots = await prisma.goalSnapshot.findMany({
    where: { month },
    select: { goalId: true },
  });
  const alreadySnapped = new Set(existingSnapshots.map((s) => s.goalId));

  const toCreate = activeGoals.filter((g) => !alreadySnapped.has(g.id));

  if (toCreate.length > 0) {
    await prisma.goalSnapshot.createMany({
      data: toCreate.map((g) => ({
        goalId: g.id,
        clientProfileId: g.clientProfileId,
        month,
        progressAtSnapshot: g.progressPercent,
      })),
    });
  }

  return NextResponse.json({
    ok: true,
    month,
    snapshotsSaved: toCreate.length,
    alreadyExisted: alreadySnapped.size,
  });
}
