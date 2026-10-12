/**
 * Runs every 30 minutes. Finds calls scheduled 16–20 hours from now
 * (window around the 18-hour target) and generates a prep brief if one
 * hasn't already been created for that call's client today.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePrepBrief } from "@/lib/agents/prep-agent";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 16 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 20 * 60 * 60 * 1000);

  // Find upcoming calls in the 16–20h window that haven't been completed yet
  const upcomingCalls = await prisma.call.findMany({
    where: {
      scheduledAt: { gte: windowStart, lte: windowEnd },
      completedAt: null,
    },
    select: { clientProfileId: true, title: true, scheduledAt: true },
  });

  if (upcomingCalls.length === 0) {
    return NextResponse.json({ ok: true, briefsGenerated: 0, message: "No calls in window" });
  }

  // Deduplicate by clientProfileId — one brief per client per trigger window
  const seen = new Set<string>();
  const uniqueCalls = upcomingCalls.filter((c) => {
    if (seen.has(c.clientProfileId)) return false;
    seen.add(c.clientProfileId);
    return true;
  });

  // Skip clients who already have a pending or approved prep-brief created today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const results: { clientId: string; draftId: string }[] = [];
  const errors: { clientId: string; error: string }[] = [];

  for (const call of uniqueCalls) {
    const existingBrief = await prisma.agentDraft.findFirst({
      where: {
        clientProfileId: call.clientProfileId,
        type: "prep-brief",
        createdAt: { gte: todayStart },
      },
    });

    if (existingBrief) continue;

    try {
      const draftId = await generatePrepBrief(call.clientProfileId);
      results.push({ clientId: call.clientProfileId, draftId });
    } catch (err) {
      errors.push({
        clientId: call.clientProfileId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ ok: true, briefsGenerated: results.length, results, errors });
}
