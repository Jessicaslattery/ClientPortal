/**
 * Cron endpoint for automated Granola sync.
 * Called by Vercel Cron (see vercel.json) every hour Mon–Fri 9am–7pm AEST.
 * Protected by CRON_SECRET to prevent unauthorised triggers.
 */

import { NextRequest, NextResponse } from "next/server";
import { syncGranolaMCP } from "@/lib/granola-sync";

export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret (set CRON_SECRET in Vercel env vars)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Only run during business hours Mon–Fri 9am–7pm AEST (UTC+10)
  const now = new Date();
  const aestHour = (now.getUTCHours() + 10) % 24;
  const dayOfWeek = new Date(now.getTime() + 10 * 60 * 60 * 1000).getUTCDay(); // 0=Sun

  if (dayOfWeek === 0 || dayOfWeek === 6 || aestHour < 9 || aestHour >= 19) {
    return NextResponse.json({ skipped: true, reason: "Outside business hours" });
  }

  try {
    const result = await syncGranolaMCP();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
