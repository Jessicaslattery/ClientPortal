import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  calculateHealthScore,
  getWeekStart,
  getPreviousWeekStarts,
  formatWeekLabel,
} from "@/lib/healthScore";
import { HealthScoreHero } from "@/components/client/HealthScoreHero";
import { WeeklyScorecardForm } from "@/components/client/WeeklyScorecardForm";
import { RunwayGauge } from "@/components/client/RunwayGauge";
import { PLSnapshot } from "@/components/client/PLSnapshot";
import { ContentScoreChart } from "@/components/client/ContentScoreChart";
import { EnergyDollarChart } from "@/components/client/EnergyDollarChart";

// Simple AI insight generator — falls back gracefully if no API key
async function generateInsight(
  score: number,
  breakdown: { revenue: number; energy: number; goals: number; pipeline: number },
  name: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    // Deterministic fallback
    const weakest = Object.entries(breakdown).sort((a, b) => a[1] - b[1])[0][0];
    const map: Record<string, string> = {
      revenue: "Revenue is your main growth lever this week · prioritise closing and following up.",
      energy: "Your energy score is pulling the number down · protect your capacity and rest where you can.",
      goals: "Goal progress is slower than ideal · pick one goal to push forward this week.",
      pipeline: "Your lead pipeline needs attention · focus on visibility and outreach today.",
    };
    return map[weakest] ?? "Log this week's scorecard to get a personalised insight.";
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 120,
      messages: [{
        role: "user",
        content: `You are a business strategist advisor. Write one sharp, personalised insight (max 25 words) for ${name} whose Founder Health Score is ${score}/100. Breakdown: Revenue ${breakdown.revenue}/25, Energy ${breakdown.energy}/25, Goals ${breakdown.goals}/25, Pipeline ${breakdown.pipeline}/25. Be direct and actionable. No markdown formatting.`,
      }],
    });
    return (msg.content[0] as { text: string }).text.trim().replace(/\*\*/g, "");
  } catch {
    return "Log this week's scorecard to get a personalised insight.";
  }
}

export default async function HealthPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const cid = session.clientProfileId;
  const now = new Date();
  const thisWeek = getWeekStart(now);
  const weekStarts = getPreviousWeekStarts(8, now); // last 8 weeks oldest→newest

  // ── Fetch all data in parallel ────────────────────────────────────
  const [profile, scorecards, targets, goals, expenses] = await Promise.all([
    prisma.clientProfile.findUnique({ where: { id: cid }, select: { founderName: true } }),
    prisma.weeklyScorecard.findMany({
      where: { clientProfileId: cid, weekStart: { gte: weekStarts[0] } },
      orderBy: { weekStart: "asc" },
    }),
    prisma.scorecardTargets.findUnique({ where: { clientProfileId: cid } }),
    prisma.goal.findMany({ where: { clientProfileId: cid }, select: { progressPercent: true, status: true } }),
    prisma.monthlyExpense.findMany({ where: { clientProfileId: cid } }),
  ]);

  const defaultTargets = {
    revenueTarget: targets?.revenueTarget ?? 5000,
    leadsTarget: targets?.leadsTarget ?? 5,
    callsBookedTarget: targets?.callsBookedTarget ?? 3,
    callsConvertedTarget: targets?.callsConvertedTarget ?? 1,
    contentTarget: targets?.contentTarget ?? 5,
    hoursTarget: targets?.hoursTarget ?? 40,
    energyTarget: targets?.energyTarget ?? 7,
    monthlyRevenueTarget: targets?.monthlyRevenueTarget ?? 20000,
  };

  // Map scorecards to week buckets
  const byWeek = new Map(scorecards.map((s) => [s.weekStart.toISOString(), s]));
  const thisWeekData = byWeek.get(thisWeek.toISOString()) ?? null;
  const last4 = weekStarts.slice(-5, -1).map((w) => byWeek.get(w.toISOString()) ?? { revenue: null, leads: null, energyScore: null });

  // ── Health score ─────────────────────────────────────────────────
  const breakdown = calculateHealthScore(last4, thisWeekData, goals, defaultTargets);
  const insight = await generateInsight(breakdown.total, breakdown, profile?.founderName ?? "you");

  // ── Monthly P&L ──────────────────────────────────────────────────
  // Sum revenue per calendar month from scorecards
  const revenueByMonth = new Map<string, number>();
  for (const s of scorecards) {
    if (s.revenue == null) continue;
    const key = `${s.weekStart.getUTCFullYear()}-${String(s.weekStart.getUTCMonth() + 1).padStart(2, "0")}`;
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + s.revenue);
  }

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      label: d.toLocaleDateString("en-AU", { month: "short" }),
      revenue: revenueByMonth.get(key) ?? 0,
      target: defaultTargets.monthlyRevenueTarget,
    };
  });

  const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const currentMonthRevenue = revenueByMonth.get(currentMonthKey) ?? 0;
  const totalMonthlyExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // ── Runway ───────────────────────────────────────────────────────
  // Estimate MRR from last 4 weeks average revenue
  const recentRevs = last4.map((w) => w.revenue ?? null).filter((r): r is number => r !== null);
  const weeklyMRR = recentRevs.length > 0 ? recentRevs.reduce((a, b) => a + b, 0) / recentRevs.length : 0;
  const estimatedMRR = weeklyMRR * 4.33;
  const runway = totalMonthlyExpenses > 0 ? estimatedMRR / totalMonthlyExpenses : Infinity;

  // ── 8-week chart data ────────────────────────────────────────────
  const chartWeeks = weekStarts.map((w) => {
    const s = byWeek.get(w.toISOString());
    const lbl = w.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
    return {
      weekLabel: lbl,
      posts: s?.contentPieces ?? null,
      enquiries: s?.contentEnquiries ?? null,
      ratio: s?.contentPieces && s.contentPieces > 0 ? (s.contentEnquiries ?? 0) / s.contentPieces : null,
      revenue: s?.revenue ?? null,
      energy: s?.energyScore ?? null,
      energyRatio: s?.revenue != null && s.energyScore != null && s.energyScore > 0
        ? s.revenue / s.energyScore
        : null,
    };
  });

  const energyWeeks = chartWeeks.map((w) => ({
    weekLabel: w.weekLabel,
    revenue: w.revenue,
    energy: w.energy,
    ratio: w.energyRatio,
  }));

  const contentWeeks = chartWeeks.map((w) => ({
    weekLabel: w.weekLabel,
    posts: w.posts,
    enquiries: w.enquiries,
    ratio: w.ratio,
  }));

  // History for scorecard (exclude current week)
  const mapRow = (s: NonNullable<ReturnType<typeof byWeek.get>>) => ({
    weekStart: s.weekStart,
    revenue: s.revenue,
    leads: s.leads,
    callsBooked: s.callsBooked,
    callsConverted: s.callsConverted,
    contentPieces: s.contentPieces,
    hoursWorked: s.hoursWorked,
    energyScore: s.energyScore,
    contentEnquiries: s.contentEnquiries,
    currentClients: s.currentClients ?? null,
    cancellations: s.cancellations ?? null,
    avgClientValue: s.avgClientValue ?? null,
    followerGrowth: s.followerGrowth ?? null,
    bestPerformingPost: s.bestPerformingPost ?? null,
    biggestWin: s.biggestWin ?? null,
    biggestBlock: s.biggestBlock ?? null,
  });

  const history = weekStarts
    .slice(0, -1)
    .map((w) => byWeek.get(w.toISOString()))
    .filter((s): s is NonNullable<typeof s> => s != null)
    .map(mapRow)
    .reverse();

  const currentWeekForForm = thisWeekData ? mapRow(thisWeekData) : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Page header */}
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Business Health
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          {now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Hero: Health Score */}
      <HealthScoreHero breakdown={breakdown} insight={insight} />

      {/* Row: Scorecard + Runway */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <WeeklyScorecardForm
            currentWeek={currentWeekForForm}
            targets={defaultTargets}
            history={history}
            totalExpenses={totalMonthlyExpenses}
          />
        </div>
        <div className="space-y-6">
          <RunwayGauge
            months={runway}
            mrr={Math.round(estimatedMRR)}
            monthlyExpenses={totalMonthlyExpenses}
          />
        </div>
      </div>

      {/* P&L */}
      <PLSnapshot
        months={monthLabels}
        currentRevenue={currentMonthRevenue}
        monthlyTarget={defaultTargets.monthlyRevenueTarget}
        expenses={expenses.map((e) => ({ id: e.id, name: e.name, amount: e.amount }))}
      />

      {/* Row: Content + Energy */}
      <div className="grid grid-cols-2 gap-6">
        <ContentScoreChart weeks={contentWeeks} />
        <EnergyDollarChart weeks={energyWeeks} />
      </div>

      {/* Goal progress pulled automatically */}
      {goals.length > 0 && (
        <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550] mb-4">Goal Progress</p>
          <div className="space-y-4">
            {goals.map((g, i) => {
              const pct = g.progressPercent;
              const color = pct >= 70 ? "#2D6A4F" : pct >= 40 ? "#B7791F" : "#9B2335";
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1A1714]">Goal {i + 1}</span>
                    <span style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#F2EDE4] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#8C8277] mt-4 italic">
            Update goal percentages in the Goals section to keep this current.
          </p>
        </div>
      )}
    </div>
  );
}
