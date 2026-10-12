/**
 * Last day of every month at 8am AEST (UTC+10 = 22:00 UTC previous day).
 * Vercel cron: "0 22 28-31 * *" — checks inside that today is actually the last day of the month.
 * Generates progress reports for all active clients.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateProgressReport } from "@/lib/agents/progress-agent";

function isLastDayOfMonth(date: Date): boolean {
  const tomorrow = new Date(date);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.getUTCDate() === 1;
}

function getMonthString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const now = new Date();

  if (!isLastDayOfMonth(now)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Not the last day of the month",
      date: now.toISOString(),
    });
  }

  const month = getMonthString(now);
  const allClients = await prisma.clientProfile.findMany({ select: { id: true } });

  const results: { clientId: string; draftId: string }[] = [];
  const errors: { clientId: string; error: string }[] = [];

  for (const client of allClients) {
    try {
      const draftId = await generateProgressReport(client.id, month);
      results.push({ clientId: client.id, draftId });
    } catch (err) {
      errors.push({
        clientId: client.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    month,
    reportsGenerated: results.length,
    results,
    errors,
  });
}
