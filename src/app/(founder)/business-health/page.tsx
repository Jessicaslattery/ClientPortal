import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculatePivotHealth } from "@/lib/pivotHealthScore";
import { PivotHealthHero } from "@/components/founder/PivotHealthHero";
import Link from "next/link";

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function startOfLastMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
}

// ── AI insight ────────────────────────────────────────────────────────────────

async function generateBusinessInsight(
  score: number,
  breakdown: { revenue: number; clients: number; delivery: number; growth: number }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    const weakest = Object.entries(breakdown).sort((a, b) => a[1] - b[1])[0][0];
    const map: Record<string, string> = {
      revenue: "Revenue momentum needs attention. Review client billing and identify upsell opportunities.",
      clients: "Some clients need a check-in. Proactive contact now prevents churn later.",
      delivery: "Your task backlog is building up. Clear overdue items before taking on new work.",
      growth: "No new clients onboarded recently. Consider what is filling the top of your pipeline.",
    };
    return map[weakest] ?? "Log this week's data to get a personalised business insight.";
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const ai = new Anthropic({ apiKey });
    const msg = await ai.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 120,
      messages: [{
        role: "user",
        content: `You are a business advisor for Jess, who runs Pivot Co., a premium coaching business. Write one sharp, direct insight (max 30 words) for her overall business health score of ${score}/100. Buckets: Revenue ${breakdown.revenue}/25, Clients ${breakdown.clients}/25, Delivery ${breakdown.delivery}/25, Growth ${breakdown.growth}/25. Be specific and actionable. Australian English. No markdown formatting.`,
      }],
    });
    return (msg.content[0] as { text: string }).text.trim().replace(/\*\*/g, "");
  } catch {
    return "Log this week's data to get a personalised business insight.";
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BusinessHealthPage() {
  await requireAuth("founder");

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfLastMonth(now);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // ── Fetch everything in parallel ─────────────────────────────────────────
  const [
    clients,
    allScorecards,
    churnRisks,
    recentCheckins,
    founderTasks,
    pendingDrafts,
  ] = await Promise.all([
    prisma.clientProfile.findMany({
      select: {
        id: true,
        founderName: true,
        businessName: true,
        tier: true,
        currentMonth: true,
        currentWeek: true,
        onboardingComplete: true,
        startDate: true,
        monthlyInvestment: true,
      },
      orderBy: { founderName: "asc" },
    }),

    // Revenue data: scorecards for this month + last month
    prisma.weeklyScorecard.findMany({
      where: { weekStart: { gte: lastMonthStart } },
      select: { clientProfileId: true, weekStart: true, revenue: true },
    }),

    // Active churn risks
    prisma.churnRisk.findMany({
      where: { resolved: false },
      select: { clientProfileId: true },
    }),

    // Clients with a check-in in the last 14 days
    prisma.checkIn.findMany({
      where: { createdAt: { gte: twoWeeksAgo } },
      select: { clientProfileId: true },
      distinct: ["clientProfileId"],
    }),

    // Founder tasks
    prisma.task.findMany({
      where: {
        completed: false,
        OR: [{ assignedTo: "founder" }, { owner: "Jess" }],
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        category: true,
        clientProfileId: true,
        clientProfile: { select: { founderName: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    }),

    // Pending agent drafts
    prisma.agentDraft.count({ where: { status: "pending" } }),
  ]);

  // ── Revenue calculations ──────────────────────────────────────────────────
  const thisMonthRevenue = allScorecards
    .filter((s) => s.weekStart >= thisMonthStart)
    .reduce((sum, s) => sum + (s.revenue ?? 0), 0);

  const lastMonthRevenue = allScorecards
    .filter((s) => s.weekStart >= lastMonthStart && s.weekStart < thisMonthStart)
    .reduce((sum, s) => sum + (s.revenue ?? 0), 0);

  const totalMRR = clients.reduce((sum, c) => sum + (c.monthlyInvestment ?? 0), 0);

  // ── Client metrics ────────────────────────────────────────────────────────
  const activeChurnRiskClientIds = new Set(churnRisks.map((r) => r.clientProfileId));
  const recentCheckinClientIds = new Set(recentCheckins.map((c) => c.clientProfileId));

  const clientsWithCompletedOnboarding = clients.filter((c) => c.onboardingComplete).length;

  const thisMonthStart30 = new Date(now.getFullYear(), now.getMonth(), 1);
  const newClientsThisMonth = clients.filter((c) => new Date(c.startDate) >= thisMonthStart30).length;

  // ── Task metrics ──────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = founderTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today
  );

  // ── Health score ──────────────────────────────────────────────────────────
  const breakdown = calculatePivotHealth({
    thisMonthRevenue,
    lastMonthRevenue,
    mrrTarget: totalMRR, // use contracted MRR as target
    totalClients: clients.length,
    activeChurnRisks: activeChurnRiskClientIds.size,
    clientsWithRecentCheckin: recentCheckinClientIds.size,
    overdueFounderTasks: overdueTasks.length,
    totalFounderTasks: founderTasks.length,
    pendingAgentDrafts: pendingDrafts,
    newClientsThisMonth,
    clientsWithCompletedOnboarding,
  });

  const insight = await generateBusinessInsight(breakdown.total, breakdown);

  // ── Revenue per client for the table ─────────────────────────────────────
  const revenueByClient = new Map<string, number>();
  for (const s of allScorecards.filter((s) => s.weekStart >= thisMonthStart)) {
    revenueByClient.set(
      s.clientProfileId,
      (revenueByClient.get(s.clientProfileId) ?? 0) + (s.revenue ?? 0)
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Business Health
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          {now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Hero score */}
      <PivotHealthHero breakdown={breakdown} insight={insight} />

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly MRR", value: `$${totalMRR.toLocaleString("en-AU")}` },
          { label: "Revenue this month", value: `$${thisMonthRevenue.toLocaleString("en-AU")}` },
          { label: "Active clients", value: clients.length },
          { label: "Pending drafts", value: pendingDrafts },
        ].map((s) => (
          <div key={s.label}
            className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-5"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">{s.label}</p>
            <p className="font-display text-3xl font-light text-[#1A1714] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Client health grid */}
      <div>
        <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">Client Overview</h2>
        <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]"
          style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
        >
          {clients.length === 0 && (
            <p className="px-6 py-8 text-sm text-[#8C8277]">No clients yet.</p>
          )}
          {clients.map((client) => {
            const hasChurnRisk = activeChurnRiskClientIds.has(client.id);
            const hasRecentCheckin = recentCheckinClientIds.has(client.id);
            const monthRevenue = revenueByClient.get(client.id) ?? 0;

            const status = hasChurnRisk
              ? { dot: "bg-[#9B2335]", label: "At risk", text: "text-[#9B2335]" }
              : !hasRecentCheckin
              ? { dot: "bg-[#B7791F]", label: "No recent check-in", text: "text-[#B7791F]" }
              : { dot: "bg-[#2D6A4F]", label: "On track", text: "text-[#2D6A4F]" };

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#F2EDE4] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
                  <div>
                    <p className="text-sm text-[#1A1714] group-hover:text-[#C8B89A] transition-colors">
                      {client.founderName}
                    </p>
                    <p className="text-xs text-[#8C8277]">{client.businessName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                  <div>
                    <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Revenue this month</p>
                    <p className="text-xs text-[#1A1714] mt-0.5">
                      {monthRevenue > 0 ? `$${monthRevenue.toLocaleString("en-AU")}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Progress</p>
                    <p className="text-xs text-[#1A1714] mt-0.5">Month {client.currentMonth}, Week {client.currentWeek}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] tracking-[0.08em] uppercase ${status.text}`}>{status.label}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">
            Overdue Tasks ({overdueTasks.length})
          </h2>
          <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {overdueTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B2335] shrink-0" />
                  <p className="text-sm text-[#1A1714]">{t.title}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <p className="text-xs text-[#8C8277]">{t.clientProfile?.founderName}</p>
                  {t.dueDate && (
                    <p className="text-xs text-[#9B2335]">
                      Due {new Date(t.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue trend: this month vs last */}
      <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6"
        style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
      >
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">Revenue Summary</p>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">This month</p>
            <p className="font-display text-3xl font-light text-[#1A1714] mt-1">
              ${thisMonthRevenue.toLocaleString("en-AU")}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Last month</p>
            <p className="font-display text-3xl font-light text-[#5C5550] mt-1">
              ${lastMonthRevenue.toLocaleString("en-AU")}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Movement</p>
            {(() => {
              const diff = thisMonthRevenue - lastMonthRevenue;
              const pct = lastMonthRevenue > 0 ? Math.round((diff / lastMonthRevenue) * 100) : null;
              const positive = diff >= 0;
              return (
                <p className={`font-display text-3xl font-light mt-1 ${positive ? "text-[#2D6A4F]" : "text-[#9B2335]"}`}>
                  {positive ? "+" : ""}{diff > 0 || diff < 0 ? `$${Math.abs(diff).toLocaleString("en-AU")}` : "-"}
                  {pct !== null && (
                    <span className="text-sm ml-1">({positive ? "+" : ""}{pct}%)</span>
                  )}
                </p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Churn risk signals */}
      {churnRisks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">
              Active Churn Signals ({churnRisks.length})
            </h2>
            <Link href="/dashboard" className="text-[10px] tracking-[0.08em] uppercase text-[#C8B89A] hover:opacity-70 transition-opacity">
              View in dashboard
            </Link>
          </div>
          <div className="rounded-3xl border border-[#FBEAF0] bg-[#FBEAF0]/40 px-6 py-4">
            <p className="text-xs text-[#9B2335]">
              {churnRisks.length} client{churnRisks.length !== 1 ? "s" : ""} with unresolved risk signals.
              Run Pulse from the dashboard to review and resolve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
