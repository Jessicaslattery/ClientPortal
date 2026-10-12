/**
 * Friday 3pm AEST pulse run.
 * Generates friday_progress messages for all active clients and runs churn monitor.
 * Called by Vercel Cron — see vercel.json.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePulseMessage } from "@/lib/agents/pulse-agent";
import { runChurnMonitor } from "@/lib/agents/churn-monitor";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const allClients = await prisma.clientProfile.findMany({ select: { id: true } });

  const progressResults: { clientId: string; draftId: string }[] = [];
  const errors: { clientId: string; error: string }[] = [];

  for (const client of allClients) {
    try {
      const draftId = await generatePulseMessage(client.id, "friday_progress");
      progressResults.push({ clientId: client.id, draftId });
    } catch (err) {
      errors.push({ clientId: client.id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  const churnResults = await runChurnMonitor();

  return NextResponse.json({
    ok: true,
    progressMessagesSent: progressResults.length,
    churnFlagsRaised: churnResults.reduce((n, r) => n + r.signals.length, 0),
    progressResults,
    churnResults,
    errors,
  });
}
