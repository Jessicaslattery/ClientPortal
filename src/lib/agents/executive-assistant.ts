import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { calculateHealthScore, getWeekStart, getPreviousWeekStarts } from "@/lib/healthScore";

const MONDAY_SYSTEM_PROMPT = `You are the Pivot Co. Executive Assistant Agent: the personal Chief of Staff to Jess, founder of Pivot Co.

Return plain text. Formatted with clear sections.

MONDAY BRIEFING structure:
GOOD MORNING, JESS: [date]

CLIENT STATUS
[Table: Client name | Health score | Status | Last check-in]
[Flag URGENT for health score drops 2 weeks running]
[Flag ACTION NEEDED for missing check-ins]

THIS WEEK'S CALLS
[List each call: client name, day, time, one-line prep note]

PIVOT CO. NUMBERS
[MRR vs weekly target]
[Clients per tier breakdown]

YOUR OPEN TASKS
[Prioritised list]

UNREAD MESSAGES
[Count and client names]

THIS WEEK'S FOCUS:
[One sentence: the single highest leverage thing]

Australian English. Direct and warm. Every word earns its place.`;

const FRIDAY_SYSTEM_PROMPT = `You are the Pivot Co. Executive Assistant Agent: the personal Chief of Staff to Jess, founder of Pivot Co.

Return plain text. Formatted with clear sections.

FRIDAY WRAP-UP structure:
WEEK WRAP: [date]

CLIENT HIGHLIGHTS
[One win or moment per client this week]

WHAT ROLLED OVER
[Tasks and items that didn't get done]

REVENUE
[Week's revenue vs target: hit / missed / ahead]

NEXT WEEK TO WATCH:
[One client or situation needing proactive attention]

Australian English. Direct and warm. Every word earns its place.`;

export async function generateFounderBriefing(type: "monday" | "friday"): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const now = new Date();
  const weekStarts = getPreviousWeekStarts(5, now);
  const thisWeek = getWeekStart(now);
  const weekStart = new Date(thisWeek);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const clients = await prisma.clientProfile.findMany({
    include: {
      tasks: { where: { completed: false }, orderBy: { priority: "asc" } },
      checkIns: { orderBy: { createdAt: "desc" }, take: 2 },
      calls: {
        where: { scheduledAt: { gte: weekStart, lte: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { scheduledAt: "asc" },
      },
      messages: { where: { read: false, senderRole: "client" } },
      scorecards: { where: { weekStart: { gte: weekStarts[0] } }, orderBy: { weekStart: "asc" } },
      scorecardTargets: true,
      goals: { select: { progressPercent: true, status: true } },
    },
    orderBy: { founderName: "asc" },
  });

  const nullScorecard = { revenue: null, leads: null, energyScore: null } as const;

  // Health scores
  const healthById = new Map(
    clients.map((c) => {
      const byWeek = new Map(c.scorecards.map((s) => [s.weekStart.toISOString(), s]));
      const currentWeekData = byWeek.get(thisWeek.toISOString()) ?? null;
      const last4 = weekStarts.slice(0, 4).map((w) => byWeek.get(w.toISOString()) ?? nullScorecard);
      const t = c.scorecardTargets ?? { leadsTarget: 5 };
      return [c.id, calculateHealthScore(last4, currentWeekData, c.goals, t)];
    })
  );

  // MRR — sum of all active clients' monthly investment (field on profile)
  const mrr = clients.reduce((sum, c) => sum + ((c as { monthlyInvestment?: number | null }).monthlyInvestment ?? 0), 0);

  // Tier breakdown
  const tierCounts = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.tier] = (acc[c.tier] ?? 0) + 1;
    return acc;
  }, {});

  // Weekly revenue data (this week's scorecard total across clients)
  const weeklyRevenue = clients.reduce((sum, c) => {
    const thisWeekCard = c.scorecards.find((s: { weekStart: Date; revenue: number | null }) => s.weekStart.toISOString() === thisWeek.toISOString());
    return sum + (thisWeekCard?.revenue ?? 0);
  }, 0);

  // Unread messages per client
  const unreadByClient = clients
    .filter((c) => c.messages.length > 0)
    .map((c) => ({ name: c.founderName, count: c.messages.length }));

  // Build context
  const lines: string[] = [];

  lines.push(`BRIEFING TYPE: ${type === "monday" ? "MONDAY MORNING" : "FRIDAY WRAP-UP"}`);
  lines.push(`DATE: ${now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`);
  lines.push(`\nPIVOT CO. MRR: $${mrr.toLocaleString("en-AU")}`);
  lines.push(`TIER BREAKDOWN: ${Object.entries(tierCounts).map(([tier, n]) => `${tier}: ${n}`).join(" | ")}`);
  lines.push(`WEEKLY REVENUE SO FAR: $${weeklyRevenue.toLocaleString("en-AU")}`);

  lines.push(`\nCLIENT DATA:`);
  for (const c of clients) {
    const h = healthById.get(c.id);
    const lastCheckIn = c.checkIns[0];
    const prevCheckIn = c.checkIns[1];
    const healthDrop = h && prevCheckIn ? h.total < 60 && prevCheckIn ? " [URGENT: score dropping]" : "" : "";
    const checkInStatus = lastCheckIn && new Date(lastCheckIn.createdAt) >= weekStart
      ? `Check-in received M${lastCheckIn.monthNumber}W${lastCheckIn.weekNumber}`
      : "[ACTION NEEDED: no check-in this week]";

    lines.push(`\n• ${c.founderName} (${c.businessName}, ${c.tier})`);
    lines.push(`  Health score: ${h?.total ?? "N/A"}/100 (${h?.label ?? "unknown"})${healthDrop}`);
    lines.push(`  Check-in: ${checkInStatus}`);
    lines.push(`  Open tasks: ${c.tasks.length}`);
    if (c.calls.length > 0) {
      for (const call of c.calls) {
        lines.push(`  Call: ${call.title}: ${new Date(call.scheduledAt).toLocaleDateString("en-AU", { weekday: "long", hour: "2-digit", minute: "2-digit" })}`);
      }
    }
    if (c.messages.length > 0) {
      lines.push(`  Unread messages: ${c.messages.length}`);
    }
    if (type === "monday" && c.tasks.length > 0) {
      lines.push(`  Open tasks: ${c.tasks.slice(0, 3).map((t: { title: string }) => t.title).join(" | ")}`);
    }
  }

  if (type === "monday") {
    // Founder's own open tasks (tasks assigned to founder across all clients)
    const founderTasks = clients.flatMap((c) =>
      c.tasks
        .filter((t: { owner: string; assignedTo: string }) => t.owner === "Founder" || t.assignedTo === "founder")
        .map((t: { title: string; priority: string }) => ({ ...t, clientName: c.founderName }))
    );
    if (founderTasks.length > 0) {
      lines.push(`\nFOUNDER'S OPEN TASKS:`);
      for (const t of founderTasks.slice(0, 8)) {
        lines.push(`• ${t.title} (${t.clientName}): priority: ${t.priority}`);
      }
    }

    if (unreadByClient.length > 0) {
      lines.push(`\nUNREAD MESSAGES:`);
      for (const u of unreadByClient) {
        lines.push(`• ${u.name}: ${u.count} message${u.count > 1 ? "s" : ""}`);
      }
    } else {
      lines.push(`\nUNREAD MESSAGES: None`);
    }
  }

  if (type === "friday") {
    // Tasks completed this week
    const completedThisWeek = await prisma.task.findMany({
      where: { completedAt: { gte: weekStart }, completed: true },
      include: { clientProfile: { select: { founderName: true } } },
    });
    if (completedThisWeek.length > 0) {
      lines.push(`\nCOMPLETED THIS WEEK:`);
      for (const t of completedThisWeek) {
        lines.push(`• ${t.title} (${t.clientProfile?.founderName})`);
      }
    }

    // Check-ins received this week
    const checkInsThisWeek = clients.filter((c) => {
      const last = c.checkIns[0];
      return last && new Date(last.createdAt) >= weekStart;
    });
    lines.push(`\nCHECK-INS THIS WEEK: ${checkInsThisWeek.length}/${clients.length}`);
    const missing = clients.filter((c) => {
      const last = c.checkIns[0];
      return !last || new Date(last.createdAt) < weekStart;
    });
    if (missing.length > 0) {
      lines.push(`Missing: ${missing.map((c) => c.founderName).join(", ")}`);
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: type === "monday" ? MONDAY_SYSTEM_PROMPT : FRIDAY_SYSTEM_PROMPT,
    messages: [{ role: "user", content: lines.join("\n") }],
  });

  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");

  // Save as AgentOutput — auto-published, no approval
  await prisma.agentOutput.create({
    data: {
      type: "founder_briefing",
      content: block.text,
      clientProfileId: null,
    },
  });

  return block.text;
}
