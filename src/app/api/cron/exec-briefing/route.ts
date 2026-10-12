/**
 * Monday 7am AEST (Sun 21:00 UTC): generates the founder's Monday morning briefing.
 * Friday 5pm AEST (Fri 07:00 UTC): generates the Friday wrap-up.
 * Auto-published to founder dashboard — no approval required.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateFounderBriefing } from "@/lib/agents/executive-assistant";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Determine monday vs friday by day of week (UTC)
  const day = new Date().getUTCDay(); // 0=Sun (Mon briefing runs Sun night UTC), 5=Fri
  const type = day === 5 ? "friday" : "monday";

  try {
    await generateFounderBriefing(type);
    return NextResponse.json({ ok: true, type });
  } catch (err) {
    console.error("[exec-briefing] Error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
