/**
 * Health Score calculation logic.
 * Score = 0–100, composed of 4 equal 25-point buckets.
 */

export type HealthBreakdown = {
  revenue: number;   // 0–25
  energy: number;    // 0–25
  goals: number;     // 0–25
  pipeline: number;  // 0–25
  total: number;     // 0–100
  color: "green" | "amber" | "red";
  label: string;
};

type ScorecardRow = {
  revenue: number | null;
  leads: number | null;
  energyScore: number | null;
};

type GoalRow = {
  progressPercent: number;
  status: string;
};

type Targets = {
  leadsTarget: number;
};

export function calculateHealthScore(
  last4Weeks: ScorecardRow[],
  currentWeek: ScorecardRow | null,
  goals: GoalRow[],
  targets: Targets
): HealthBreakdown {
  // ── 1. Revenue trajectory (25 pts) ──────────────────────────────────
  let revenueScore = 12.5; // neutral default
  const revenues = last4Weeks.map((w) => w.revenue ?? null).filter((r): r is number => r !== null);
  if (revenues.length >= 2) {
    const first = revenues.slice(0, Math.floor(revenues.length / 2));
    const second = revenues.slice(Math.floor(revenues.length / 2));
    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length;
    if (avgFirst === 0) {
      revenueScore = avgSecond > 0 ? 20 : 12.5;
    } else {
      const change = (avgSecond - avgFirst) / avgFirst;
      if (change >= 0.1) revenueScore = 25;
      else if (change >= -0.05) revenueScore = 17;
      else if (change >= -0.2) revenueScore = 10;
      else revenueScore = 5;
    }
  }

  // ── 2. Energy score (25 pts) ─────────────────────────────────────────
  let energyScore = 12.5;
  if (currentWeek?.energyScore != null) {
    energyScore = (currentWeek.energyScore / 10) * 25;
  } else {
    // fall back to most recent week
    const latest = last4Weeks.find((w) => w.energyScore != null);
    if (latest?.energyScore != null) {
      energyScore = (latest.energyScore / 10) * 25;
    }
  }

  // ── 3. Goal progress (25 pts) ────────────────────────────────────────
  let goalsScore = 12.5;
  const activeGoals = goals.filter((g) => g.status === "active");
  if (activeGoals.length > 0) {
    const onTrack = activeGoals.filter((g) => g.progressPercent >= 40).length;
    const ratio = onTrack / activeGoals.length;
    goalsScore = ratio * 25;
  }

  // ── 4. Lead pipeline (25 pts) ────────────────────────────────────────
  let pipelineScore = 12.5;
  const currentLeads = currentWeek?.leads ?? last4Weeks.find((w) => w.leads != null)?.leads ?? null;
  if (currentLeads !== null && targets.leadsTarget > 0) {
    pipelineScore = Math.min(25, (currentLeads / targets.leadsTarget) * 25);
  }

  const total = Math.round(revenueScore + energyScore + goalsScore + pipelineScore);
  const color: HealthBreakdown["color"] = total >= 70 ? "green" : total >= 40 ? "amber" : "red";
  const label = color === "green" ? "Strong" : color === "amber" ? "Needs attention" : "At risk";

  return {
    revenue: Math.round(revenueScore),
    energy: Math.round(energyScore),
    goals: Math.round(goalsScore),
    pipeline: Math.round(pipelineScore),
    total,
    color,
    label,
  };
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${weekStart.toLocaleDateString("en-AU", opts)} – ${end.toLocaleDateString("en-AU", opts)}`;
}

export function getPreviousWeekStarts(n: number, from: Date = new Date()): Date[] {
  const weeks: Date[] = [];
  const current = getWeekStart(from);
  for (let i = 0; i < n; i++) {
    const d = new Date(current);
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.push(d);
  }
  return weeks.reverse(); // oldest first
}
