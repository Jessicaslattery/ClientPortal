/**
 * Every Monday 6am AEST (Sun 20:00 UTC): researches and publishes this week's trend digest.
 * Runs before the exec briefing so trend data is available for the Monday morning brief.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateTrendDigest } from "@/lib/agents/trend-agent";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    await generateTrendDigest();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[trend-digest] Error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
