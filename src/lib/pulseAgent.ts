/**
 * Pulse Agent — scans all active clients weekly for churn signals.
 *
 * Signals detected:
 * - Missed check-in (no check-in this week)
 * - Low energy trend (avg < 5 over last 3 check-ins)
 * - Stalled goals (no progress increase in 4 weeks)
 * - Revenue declining (last 2 weeks down vs prior 2)
 * - No call booked for 14+ days
 * - Overdue tasks piling up (5+)
 */

import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

export type PulseSignal = {
  clientProfileId: string;
  founderName: string;
  signals: string[];
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
};

// ─── Signal detection ─────────────────────────────────────────────────────────

async function detectSignals(clientId: string): Promise<string[]> {
  const signals: string[] = [];
  const now = new Date();

  const [client, recentCheckIns, upcomingCalls, openTasks, recentScorecards, goals] =
    await Promise.all([
      prisma.clientProfile.findUnique({ where: { id: clientId } }),
      prisma.checkIn.findMany({
        where: { clientProfileId: clientId },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.call.findMany({
        where: { clientProfileId: clientId, scheduledAt: { gte: now } },
        take: 1,
      }),
      prisma.task.findMany({
        where: { clientProfileId: clientId, completed: false },
      }),
      prisma.weeklyScorecard.findMany({
        where: { clientProfileId: clientId },
        orderBy: { weekStart: "desc" },
        take: 4,
      }),
      prisma.goal.findMany({
        where: { clientProfileId: clientId, status: "active" },
      }),
    ]);

  if (!client) return signals;

  // 1. Missed check-in this week
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const checkedInRecently = recentCheckIns.some(
    (c) => new Date(c.createdAt) >= oneWeekAgo
  );
  if (!checkedInRecently) {
    signals.push("No check-in submitted this week");
  }

  // 2. Low energy trend
  if (recentCheckIns.length >= 3) {
    const avgEnergy =
      recentCheckIns.slice(0, 3).reduce((s, c) => s + (c.energyScore || 0), 0) / 3;
    if (avgEnergy < 5) {
      signals.push(`Low energy trend (avg ${avgEnergy.toFixed(1)}/10 over last 3 check-ins)`);
    }
  }

  // 3. No call booked
  if (upcomingCalls.length === 0) {
    signals.push("No upcoming call scheduled");
  }

  // 4. Overdue tasks
  const overdueTasks = openTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now
  );
  if (overdueTasks.length >= 3) {
    signals.push(`${overdueTasks.length} overdue tasks accumulating`);
  }

  // 5. Revenue declining
  if (recentScorecards.length >= 4) {
    const recent = recentScorecards.slice(0, 2).map((s) => s.revenue ?? 0);
    const prior = recentScorecards.slice(2, 4).map((s) => s.revenue ?? 0);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / 2;
    const priorAvg = prior.reduce((a, b) => a + b, 0) / 2;
    if (priorAvg > 0 && recentAvg < priorAvg * 0.7) {
      signals.push(
        `Revenue declining: down ${Math.round((1 - recentAvg / priorAvg) * 100)}% vs prior fortnight`
      );
    }
  }

  // 6. Stalled goals
  const stalledGoals = goals.filter((g) => g.progressPercent < 10 && g.status === "active");
  if (stalledGoals.length > 0) {
    signals.push(`${stalledGoals.length} active goal${stalledGoals.length > 1 ? "s" : ""} showing no progress`);
  }

  return signals;
}

function scoreRiskLevel(signals: string[]): "low" | "medium" | "high" {
  if (signals.length === 0) return "low";
  if (signals.length >= 3) return "high";
  return "medium";
}

// ─── AI recommendation ────────────────────────────────────────────────────────

async function generateRecommendation(
  founderName: string,
  businessName: string,
  signals: string[]
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY || signals.length === 0) {
    return signals.length === 0
      ? "Client is tracking well. no action required."
      : "Review with client on next call.";
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `You are a business coach advisor. ${founderName} (${businessName}) is showing these warning signals: ${signals.join("; ")}. Write one sharp, specific recommended action for their coach (max 20 words). Be direct and actionable. Australian English.`,
        },
      ],
    });
    return (msg.content[0] as { text: string }).text.trim();
  } catch {
    return "Reach out proactively before next session.";
  }
}

// ─── Main pulse run ───────────────────────────────────────────────────────────

export async function runPulseAgent(): Promise<PulseSignal[]> {
  const clients = await prisma.clientProfile.findMany({
    select: { id: true, founderName: true, businessName: true },
  });

  const results: PulseSignal[] = [];

  for (const client of clients) {
    const signals = await detectSignals(client.id);
    const riskLevel = scoreRiskLevel(signals);

    // Only persist medium/high risk
    if (riskLevel !== "low") {
      // Avoid duplicating signals already flagged today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const signal of signals) {
        const existing = await prisma.churnRisk.findFirst({
          where: {
            clientProfileId: client.id,
            signal,
            detectedAt: { gte: today },
            resolved: false,
          },
        });
        if (!existing) {
          await prisma.churnRisk.create({
            data: { clientProfileId: client.id, signal },
          });
        }
      }
    }

    const recommendation = await generateRecommendation(
      client.founderName,
      client.businessName,
      signals
    );

    results.push({
      clientProfileId: client.id,
      founderName: client.founderName,
      signals,
      riskLevel,
      recommendation,
    });
  }

  return results;
}
