import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BroadcastForm } from "@/components/founder/BroadcastForm";
import { ChurnMonitor } from "@/components/founder/ChurnMonitor";
import { GranolaDashboardStrip } from "@/components/founder/GranolaDashboardStrip";
import { FounderSuggestions } from "@/components/founder/FounderSuggestions";
import { FounderBriefingPanel } from "@/components/founder/FounderBriefingPanel";
import { TrendDigestPanel } from "@/components/founder/TrendDigestPanel";
import { calculateHealthScore, getWeekStart, getPreviousWeekStarts } from "@/lib/healthScore";
import Link from "next/link";

export default async function CommandCentrePage() {
  await requireAuth("founder");

  const now = new Date();
  const weekStarts = getPreviousWeekStarts(5, now);
  const thisWeek = getWeekStart(now);

  const clients = await prisma.clientProfile.findMany({
    include: {
      tasks: { where: { completed: false } },
      checkIns: { orderBy: { createdAt: "desc" }, take: 1 },
      calls: { where: { scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: "asc" }, take: 1 },
      agentDrafts: { where: { status: "pending" } },
      messages: { where: { read: false, senderRole: "client" } },
      scorecards: { where: { weekStart: { gte: weekStarts[0] } }, orderBy: { weekStart: "asc" } },
      scorecardTargets: true,
      goals: { select: { progressPercent: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    // nextSessionFocus is a top-level field, always included
  });

  // Calculate health score per client
  const clientHealthScores = clients.map((c) => {
    const byWeek = new Map(c.scorecards.map((s) => [s.weekStart.toISOString(), s]));
    const currentWeekData = byWeek.get(thisWeek.toISOString()) ?? null;
    const last4 = weekStarts.slice(0, 4).map((w) => byWeek.get(w.toISOString()) ?? { revenue: null, leads: null, energyScore: null });
    const t = c.scorecardTargets ?? { leadsTarget: 5 };
    return { id: c.id, breakdown: calculateHealthScore(last4, currentWeekData, c.goals, t) };
  });
  const healthById = new Map(clientHealthScores.map((s) => [s.id, s.breakdown]));

  const weekStart = new Date(thisWeek);

  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const [activeChurnRisks, lastMessageByClient, unmatchedTranscripts, lastSyncLog, clientsForGranola, founderSuggestions, latestBriefing, latestTrendDigest] =
    await Promise.all([
      prisma.churnRisk.findMany({
        where: { resolved: false },
        include: { clientProfile: { select: { founderName: true, tier: true } } },
        orderBy: { detectedAt: "desc" },
      }),
      prisma.message.findMany({
        where: {
          clientProfileId: { in: clients.map((c) => c.id) },
        },
        orderBy: { createdAt: "desc" },
        distinct: ["clientProfileId"],
        select: { clientProfileId: true, createdAt: true },
      }),
      prisma.unmatchedTranscript.findMany({
        where: { resolved: false },
        orderBy: { date: "desc" },
      }),
      prisma.granolaSyncLog.findFirst({ orderBy: { runAt: "desc" } }),
      prisma.clientProfile.findMany({
        select: { id: true, founderName: true, businessName: true },
        orderBy: { founderName: "asc" },
      }),
      prisma.founderSuggestion.findMany({
        where: { month: currentMonth },
        orderBy: { createdAt: "desc" },
      }),
      prisma.agentOutput.findFirst({
        where: { type: "founder_briefing", clientProfileId: null },
        orderBy: { createdAt: "desc" },
      }),
      prisma.agentOutput.findFirst({
        where: { type: "trend_digest", clientProfileId: null },
        orderBy: { createdAt: "desc" },
      }),
    ]);
  const clientNamesMap = new Map(clients.map((c) => [c.id, c.founderName]));
  const lastMessageMap = new Map(lastMessageByClient.map((m) => [m.clientProfileId, m.createdAt]));

  const pendingDrafts = clients.flatMap((c) => c.agentDrafts);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingCalls = clients
    .flatMap((c) =>
      c.calls.map((call) => ({ ...call, clientName: c.founderName, clientId: c.id }))
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  const thisWeekCalls = upcomingCalls.filter((c) => new Date(c.scheduledAt) <= nextWeek);
  const checkInsThisWeek = clients.filter((c) => {
    const last = c.checkIns[0];
    return last && new Date(last.createdAt) >= weekStart;
  }).length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Command Centre
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          {now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* This week's briefing */}
      <div>
        <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">This Week's Briefing</h2>
        <FounderBriefingPanel initial={latestBriefing ? { id: latestBriefing.id, content: latestBriefing.content, createdAt: latestBriefing.createdAt.toISOString() } : null} />
      </div>

      {/* Trend digest */}
      <div>
        <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">Trend Digest</h2>
        <TrendDigestPanel initial={latestTrendDigest ? { id: latestTrendDigest.id, content: latestTrendDigest.content, createdAt: latestTrendDigest.createdAt.toISOString() } : null} />
      </div>

      {/* Alert strips */}
      <div className="space-y-2">
        {pendingDrafts.length > 0 && (
          <div className="rounded-3xl border border-[#C8B89A]/25 bg-[#C8B89A]/5 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8B89A] animate-pulse" />
              <p className="text-sm text-[#C8B89A]">
                {pendingDrafts.length} agent draft{pendingDrafts.length > 1 ? "s" : ""} awaiting review
              </p>
            </div>
            <Link href="/agent-workspace" className="text-xs tracking-[0.1em] uppercase text-[#C8B89A] hover:opacity-70 transition-opacity">
              Review →
            </Link>
          </div>
        )}
        <GranolaDashboardStrip
          clients={clientsForGranola}
          lastLog={lastSyncLog}
          unmatchedTranscripts={unmatchedTranscripts}
          hasMcpToken={!!process.env.GRANOLA_MCP_TOKEN}
        />
      </div>

      {/* Top row stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Active Clients", value: clients.length, color: "#1A1714" },
          { label: "Check-ins This Week", value: `${checkInsThisWeek}/${clients.length}`, color: checkInsThisWeek === clients.length ? "#2D6A4F" : "#B7791F" },
          { label: "Open Tasks", value: clients.reduce((s, c) => s + c.tasks.length, 0), color: "#1A1714" },
          { label: "Pending Drafts", value: pendingDrafts.length, color: pendingDrafts.length > 0 ? "#B7791F" : "#1A1714" },
          { label: "Unread Messages", value: clients.reduce((s, c) => s + c.messages.length, 0), color: "#1A1714" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-[#E8E2D9] p-5">
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-thin tracking-widest" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Client Health Scores Overview */}
      {clients.length > 0 && (
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">Client Health Scores</h2>
          <div className="grid grid-cols-3 gap-4">
            {clients.map((client) => {
              const h = healthById.get(client.id);
              if (!h) return null;
              const color = h.color === "green" ? "#2D6A4F" : h.color === "amber" ? "#B7791F" : "#9B2335";
              const bg = h.color === "green" ? "bg-[#2D6A4F]/8" : h.color === "amber" ? "bg-[#B7791F]/8" : "bg-[#9B2335]/8";
              return (
                <Link key={client.id} href={`/clients/${client.id}`}
                  className={`rounded-3xl border border-[#E8E2D9] ${bg} p-5 hover:border-[#C8B89A]/20 transition-colors`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#1A1714]">{client.founderName}</p>
                      <p className="text-xs text-[#5C5550]">{client.businessName}</p>
                      <p className="text-[10px] tracking-[0.1em] uppercase mt-1.5" style={{ color }}>{h.label}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-4xl font-thin" style={{ color }}>{h.total}</span>
                      <p className="text-[9px] text-[#8C8277] mt-0.5">/ 100</p>
                    </div>
                  </div>
                  {client.nextSessionFocus && (
                    <p className="text-[10px] text-[#5C5550] mt-3 italic line-clamp-1">
                      Next: {client.nextSessionFocus}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {/* Client status table */}
        <div className="col-span-2">
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">
            Active Clients
          </h2>
          <div className="rounded-3xl border border-[#E8E2D9]">
            {clients.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#8C8277]">
                No clients yet. Add a client to get started.
              </div>
            ) : (
              clients.map((client, i) => {
                const lastCheckIn = client.checkIns[0];
                const checkInThisWeek =
                  lastCheckIn && new Date(lastCheckIn.createdAt) >= weekStart;
                const nextCall = client.calls[0];
                const overdueTasksCount = client.tasks.filter(
                  (t) => t.dueDate && new Date(t.dueDate) < now
                ).length;

                return (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className={`flex items-center justify-between px-6 py-4 hover:bg-[#F5F2ED] transition-colors ${
                      i !== clients.length - 1 ? "border-b border-[#E8E2D9]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-[#1A1714]">{client.founderName}</p>
                        <p className="text-xs text-[#5C5550]">{client.businessName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Tier */}
                      <StatusBadge label="Growth Partnership" status="gold" />

                      {/* Check-in status */}
                      <span className={`text-xs flex items-center gap-1.5 ${checkInThisWeek ? "text-[#2D6A4F]" : "text-[#B7791F]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${checkInThisWeek ? "bg-[#2D6A4F]" : "bg-[#B7791F]"}`} />
                        {checkInThisWeek ? "Check-in received" : "No check-in yet"}
                      </span>

                      {/* Overdue tasks */}
                      {overdueTasksCount > 0 && (
                        <StatusBadge label={`${overdueTasksCount} overdue`} status="alert" />
                      )}

                      {/* Next call */}
                      {nextCall && (
                        <span className="text-xs text-[#5C5550]">
                          Next call:{" "}
                          {new Date(nextCall.scheduledAt).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}

                      {/* Pending drafts */}
                      {client.agentDrafts.length > 0 && (
                        <StatusBadge label={`${client.agentDrafts.length} draft${client.agentDrafts.length > 1 ? "s" : ""}`} status="pending" />
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming calls */}
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">
            Upcoming Calls
          </h2>
          <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
            {upcomingCalls.length === 0 ? (
              <div className="px-5 py-6 text-sm text-[#8C8277] text-center">
                No upcoming calls scheduled.
              </div>
            ) : (
              upcomingCalls.map((call) => (
                <div key={call.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#1A1714]">{call.clientName}</p>
                    <p className="text-xs text-[#5C5550] tabular-nums">
                      {new Date(call.scheduledAt).toLocaleDateString("en-AU", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-[#5C5550]">{call.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Broadcast */}
        <div className="col-span-2">
          <BroadcastForm />
        </div>

        {/* Pulse / Churn Monitor */}
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">Client Risk</h2>
          <ChurnMonitor
            activeRisks={activeChurnRisks}
            clientNames={clientNamesMap}
            lastMessageMap={lastMessageMap}
          />
        </div>

        {/* Founder suggestions from progress reports */}
        {founderSuggestions.length > 0 && (
          <div className="col-span-2">
            <FounderSuggestions
              socialSuggestions={founderSuggestions.filter((s) => s.type === "social")}
              resourceSuggestions={founderSuggestions.filter((s) => s.type === "resource")}
              month={currentMonth}
            />
          </div>
        )}

        {/* Recent agent drafts */}
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">
            Drafts for Review
          </h2>
          <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
            {pendingDrafts.length === 0 ? (
              <div className="px-5 py-6 text-sm text-[#8C8277] text-center">
                No drafts pending review.
              </div>
            ) : (
              pendingDrafts.slice(0, 5).map((draft) => {
                const client = clients.find((c) =>
                  c.agentDrafts.some((d) => d.id === draft.id)
                );
                return (
                  <Link
                    key={draft.id}
                    href="/agent-workspace"
                    className="flex items-center justify-between px-5 py-4 hover:bg-[#F5F2ED] transition-colors"
                  >
                    <div>
                      <p className="text-sm text-[#1A1714]">{draft.title}</p>
                      <p className="text-xs text-[#5C5550]">{client?.founderName}</p>
                    </div>
                    <StatusBadge
                      label={draft.type.replace(/-/g, " ")}
                      status="gold"
                    />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
