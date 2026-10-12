import { prisma } from "@/lib/db";
import { getWeekStart } from "@/lib/healthScore";

async function flagIfNew(clientId: string, signal: string): Promise<void> {
  const weekStart = getWeekStart(new Date());
  const existing = await prisma.churnRisk.findFirst({
    where: {
      clientProfileId: clientId,
      signal,
      detectedAt: { gte: weekStart },
      resolved: false,
    },
  });
  if (!existing) {
    await prisma.churnRisk.create({
      data: { clientProfileId: clientId, signal },
    });
  }
}

export async function runChurnMonitor(): Promise<{ clientId: string; signals: string[] }[]> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = getWeekStart(now);
  const lastWeekDate = new Date(thisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgoDate = new Date(thisWeek.getTime() - 14 * 24 * 60 * 60 * 1000);

  const clients = await prisma.clientProfile.findMany({
    select: { id: true },
  });

  const results: { clientId: string; signals: string[] }[] = [];

  for (const client of clients) {
    const signals: string[] = [];

    // Signal 1: Health score declining 2 weeks in a row
    // Using energyScore on WeeklyScorecard as the proxy metric
    const scorecards = await prisma.weeklyScorecard.findMany({
      where: {
        clientProfileId: client.id,
        weekStart: { gte: twoWeeksAgoDate },
      },
      orderBy: { weekStart: "desc" },
    });

    const byWeek = new Map(scorecards.map((s) => [s.weekStart.toISOString(), s]));
    const thisWeekScore = byWeek.get(thisWeek.toISOString())?.energyScore ?? null;
    const lastWeekScore = byWeek.get(lastWeekDate.toISOString())?.energyScore ?? null;
    const twoWeeksAgoScore = byWeek.get(twoWeeksAgoDate.toISOString())?.energyScore ?? null;

    if (
      thisWeekScore != null &&
      lastWeekScore != null &&
      twoWeeksAgoScore != null &&
      thisWeekScore < lastWeekScore &&
      lastWeekScore < twoWeeksAgoScore
    ) {
      const signal = `Energy declining 3 weeks in a row (${twoWeeksAgoScore} → ${lastWeekScore} → ${thisWeekScore})`;
      signals.push(signal);
      await flagIfNew(client.id, signal);
    }

    // Signal 2: No message sent or received in last 7 days
    const recentMessage = await prisma.message.findFirst({
      where: {
        clientProfileId: client.id,
        createdAt: { gte: sevenDaysAgo },
      },
    });
    if (!recentMessage) {
      const signal = "No messages sent or received in the last 7 days";
      signals.push(signal);
      await flagIfNew(client.id, signal);
    }

    // Signal 3: Last 2 check-in energy scores both below 4
    const lastTwoCheckIns = await prisma.checkIn.findMany({
      where: { clientProfileId: client.id },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { energyScore: true },
    });
    if (
      lastTwoCheckIns.length === 2 &&
      lastTwoCheckIns[0].energyScore < 4 &&
      lastTwoCheckIns[1].energyScore < 4
    ) {
      const signal = `Low energy on last 2 check-ins (${lastTwoCheckIns[1].energyScore} and ${lastTwoCheckIns[0].energyScore}/10)`;
      signals.push(signal);
      await flagIfNew(client.id, signal);
    }

    // Signal 4: No check-in submitted in last 14 days
    const recentCheckIn = await prisma.checkIn.findFirst({
      where: {
        clientProfileId: client.id,
        createdAt: { gte: fourteenDaysAgo },
      },
    });
    if (!recentCheckIn) {
      const signal = "No check-in submitted in the last 14 days";
      signals.push(signal);
      await flagIfNew(client.id, signal);
    }

    if (signals.length > 0) {
      results.push({ clientId: client.id, signals });
    }
  }

  return results;
}
