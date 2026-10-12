/**
 * Pivot Co. Business Health Score
 * Measures the health of the coaching business itself, not any individual client.
 * Score = 0–100, four 25-pt buckets.
 */

export type PivotHealthBreakdown = {
  revenue: number;   // 0–25 — MRR trend
  clients: number;   // 0–25 — retention & engagement
  delivery: number;  // 0–25 — task/draft backlog
  growth: number;    // 0–25 — new clients & onboarding
  total: number;
  color: "green" | "amber" | "red";
  label: string;
};

// ── 1. Revenue score ──────────────────────────────────────────────────────────
// Compare this month's total revenue vs last month across all clients' scorecards.

export function calcRevenueScore(
  thisMonthRevenue: number,
  lastMonthRevenue: number,
  mrrTarget: number
): number {
  if (thisMonthRevenue === 0 && lastMonthRevenue === 0) return 12;

  // Target attainment (up to 15 pts)
  const targetPct = mrrTarget > 0 ? thisMonthRevenue / mrrTarget : 0;
  const targetScore = Math.min(15, targetPct * 15);

  // Trend vs last month (up to 10 pts)
  let trendScore = 5; // neutral
  if (lastMonthRevenue > 0) {
    const change = (thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue;
    if (change >= 0.1) trendScore = 10;
    else if (change >= 0) trendScore = 7;
    else if (change >= -0.1) trendScore = 4;
    else trendScore = 1;
  } else if (thisMonthRevenue > 0) {
    trendScore = 8;
  }

  return Math.min(25, Math.round(targetScore + trendScore));
}

// ── 2. Client retention score ─────────────────────────────────────────────────
// Penalises for active churn risks and missing check-ins.

export function calcClientsScore(
  totalClients: number,
  activeChurnRisks: number,
  clientsWithRecentCheckin: number // checked in within 14 days
): number {
  if (totalClients === 0) return 12;

  // Churn risk penalty (up to 15 pts)
  const riskRatio = activeChurnRisks / totalClients;
  const riskScore = Math.max(0, 15 - Math.round(riskRatio * 15 * 3));

  // Check-in engagement (up to 10 pts)
  const checkinRatio = clientsWithRecentCheckin / totalClients;
  const checkinScore = Math.round(checkinRatio * 10);

  return Math.min(25, Math.round(riskScore + checkinScore));
}

// ── 3. Delivery score ─────────────────────────────────────────────────────────
// Penalises for overdue founder tasks and a clogged agent workspace.

export function calcDeliveryScore(
  overdueFounderTasks: number,
  totalFounderTasks: number,
  pendingAgentDrafts: number
): number {
  // Overdue task penalty
  let taskScore = 15;
  if (totalFounderTasks > 0) {
    const overdueRatio = overdueFounderTasks / totalFounderTasks;
    taskScore = Math.max(0, Math.round(15 - overdueRatio * 15 * 2));
  }

  // Pending drafts penalty (drafts waiting > 3 days are worse)
  const draftPenalty = Math.min(10, pendingAgentDrafts * 2);
  const draftScore = Math.max(0, 10 - draftPenalty);

  return Math.min(25, Math.round(taskScore + draftScore));
}

// ── 4. Growth score ───────────────────────────────────────────────────────────
// Rewards new clients this month and onboarding completion.

export function calcGrowthScore(
  newClientsThisMonth: number,
  clientsWithCompletedOnboarding: number,
  totalClients: number
): number {
  // New client bonus (up to 15 pts, 5 per new client, max 3)
  const newClientScore = Math.min(15, newClientsThisMonth * 5);

  // Onboarding health (up to 10 pts)
  let onboardingScore = 5; // neutral if no clients
  if (totalClients > 0) {
    const ratio = clientsWithCompletedOnboarding / totalClients;
    onboardingScore = Math.round(ratio * 10);
  }

  return Math.min(25, Math.round(newClientScore + onboardingScore));
}

// ── Composite ─────────────────────────────────────────────────────────────────

export function calculatePivotHealth(params: {
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  mrrTarget: number;
  totalClients: number;
  activeChurnRisks: number;
  clientsWithRecentCheckin: number;
  overdueFounderTasks: number;
  totalFounderTasks: number;
  pendingAgentDrafts: number;
  newClientsThisMonth: number;
  clientsWithCompletedOnboarding: number;
}): PivotHealthBreakdown {
  const revenue = calcRevenueScore(params.thisMonthRevenue, params.lastMonthRevenue, params.mrrTarget);
  const clients = calcClientsScore(params.totalClients, params.activeChurnRisks, params.clientsWithRecentCheckin);
  const delivery = calcDeliveryScore(params.overdueFounderTasks, params.totalFounderTasks, params.pendingAgentDrafts);
  const growth = calcGrowthScore(params.newClientsThisMonth, params.clientsWithCompletedOnboarding, params.totalClients);

  const total = revenue + clients + delivery + growth;
  const color: PivotHealthBreakdown["color"] = total >= 70 ? "green" : total >= 40 ? "amber" : "red";
  const label = color === "green" ? "Strong" : color === "amber" ? "Needs attention" : "At risk";

  return { revenue, clients, delivery, growth, total, color, label };
}
