/**
 * Monday 9am AEST pulse run.
 * Finds clients with no check-in submitted this week and queues a checkin_nudge.
 * Called by Vercel Cron — see vercel.json.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePulseMessage } from "@/lib/agents/pulse-agent";
import { getWeekStart } from "@/lib/healthScore";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const now = new Date();
  const weekStart = getWeekStart(now);

  // Find clients who haven't submitted a check-in since last Monday
  const clientsWithCheckIn = await prisma.checkIn.findMany({
    where: { createdAt: { gte: weekStart } },
    select: { clientProfileId: true },
    distinct: ["clientProfileId"],
  });
  const checkedInIds = new Set(clientsWithCheckIn.map((c) => c.clientProfileId));

  const allClients = await prisma.clientProfile.findMany({ select: { id: true } });
  const clientsNeedingNudge = allClients.filter((c) => !checkedInIds.has(c.id));

  const results: { clientId: string; draftId: string }[] = [];
  const errors: { clientId: string; error: string }[] = [];

  for (const client of clientsNeedingNudge) {
    try {
      const draftId = await generatePulseMessage(client.id, "checkin_nudge");
      results.push({ clientId: client.id, draftId });
    } catch (err) {
      errors.push({ clientId: client.id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ ok: true, nudgesSent: results.length, results, errors });
}
