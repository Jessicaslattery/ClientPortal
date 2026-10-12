import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateContentPlan } from "@/lib/agents/content-agent";

// Run on the 1st of every month at 7am AEST: 0 21 L * * (20:00 UTC prev day = 7am AEST)
// Trigger via: GET /api/cron/content-plan?secret=CRON_SECRET

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // All active clients (those with onboarding complete)
  const clients = await prisma.clientProfile.findMany({
    where: { onboardingComplete: true },
    select: { id: true, founderName: true },
  });

  const results: Array<{ clientId: string; name: string; status: string; error?: string }> = [];

  for (const client of clients) {
    try {
      await generateContentPlan(client.id, month);
      results.push({ clientId: client.id, name: client.founderName, status: "ok" });
    } catch (err) {
      results.push({
        clientId: client.id,
        name: client.founderName,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ month, results });
}
