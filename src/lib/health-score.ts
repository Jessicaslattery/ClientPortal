export type HealthBreakdown = {
  checkInScore: number;    // 0-30: recency + frequency of check-ins
  goalScore: number;       // 0-30: avg goal progress
  taskScore: number;       // 0-20: completion rate of founder tasks
  engagementScore: number; // 0-20: messages + wins + recent activity
  total: number;           // 0-100
  label: "Thriving" | "On Track" | "Needs Attention" | "At Risk";
  color: string;
};

type HealthInput = {
  checkIns: { createdAt: Date }[];
  goals: { progressPercent: number; status: string }[];
  tasks: { completed: boolean; assignedTo: string; createdAt: Date }[];
  messages: { createdAt: Date }[];
  wins: { createdAt: Date }[];
  startDate: Date;
};

export function computeHealthScore(input: HealthInput): HealthBreakdown {
  const now = new Date();

  // ── Check-in score (0-30) ─────────────────────────────────────────────────
  // Max 30 pts: 15 for recency (last check-in within 7 days), 15 for frequency
  let checkInScore = 0;
  if (input.checkIns.length > 0) {
    const sorted = [...input.checkIns].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const daysSinceLast = (now.getTime() - sorted[0].createdAt.getTime()) / (1000 * 60 * 60 * 24);
    // Recency: full 15 if < 7 days, sliding scale to 0 at 28 days
    const recency = Math.max(0, 15 - (daysSinceLast / 28) * 15);
    // Frequency: 1 check-in per week = good; cap at 15
    const weeksActive = Math.max(1, (now.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const rate = input.checkIns.length / weeksActive;
    const frequency = Math.min(15, rate * 15);
    checkInScore = Math.round(recency + frequency);
  }

  // ── Goal score (0-30) ─────────────────────────────────────────────────────
  const activeGoals = input.goals.filter((g) => g.status === "active");
  let goalScore = 0;
  if (activeGoals.length > 0) {
    const avg = activeGoals.reduce((s, g) => s + g.progressPercent, 0) / activeGoals.length;
    goalScore = Math.round((avg / 100) * 30);
  } else if (input.goals.length === 0) {
    goalScore = 15; // neutral if no goals set yet
  }

  // ── Task score (0-20) ─────────────────────────────────────────────────────
  // Only founder-assigned tasks from last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentFounderTasks = input.tasks.filter(
    (t) => t.assignedTo === "founder" && t.createdAt >= thirtyDaysAgo
  );
  let taskScore = 10; // neutral if no tasks
  if (recentFounderTasks.length > 0) {
    const completionRate = recentFounderTasks.filter((t) => t.completed).length / recentFounderTasks.length;
    taskScore = Math.round(completionRate * 20);
  }

  // ── Engagement score (0-20) ───────────────────────────────────────────────
  // Recent messages + wins logged = engaged client
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentMessages = input.messages.filter((m) => m.createdAt >= sevenDaysAgo).length;
  const recentWins = input.wins.filter((w) => w.createdAt >= sevenDaysAgo).length;
  const engagementScore = Math.min(20, recentMessages * 3 + recentWins * 5 + (recentMessages > 0 || recentWins > 0 ? 5 : 0));

  const total = Math.min(100, checkInScore + goalScore + taskScore + engagementScore);

  let label: HealthBreakdown["label"];
  let color: string;
  if (total >= 75) { label = "Thriving"; color = "#2D6A4F"; }
  else if (total >= 55) { label = "On Track"; color = "#8C735A"; }
  else if (total >= 35) { label = "Needs Attention"; color = "#C17A2E"; }
  else { label = "At Risk"; color = "#9B2335"; }

  return { checkInScore, goalScore, taskScore, engagementScore, total, label, color };
}
