import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { calculateHealthScore, getWeekStart, getPreviousWeekStarts } from "@/lib/healthScore";
import Link from "next/link";

export default async function HQPage() {
  await requireAuth("founder");

  const now = new Date();
  const weekStarts = getPreviousWeekStarts(5, now);
  const thisWeek = getWeekStart(now);

  const clients = await prisma.clientProfile.findMany({
    include: {
      tasks: { where: { completed: false } },
      checkIns: { orderBy: { createdAt: "desc" }, take: 1 },
      calls: { where: { scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: "asc" }, take: 1 },
      messages: { where: { read: false, senderRole: "client" } },
      scorecards: { where: { weekStart: { gte: weekStarts[0] } }, orderBy: { weekStart: "asc" } },
      scorecardTargets: true,
      goals: { select: { progressPercent: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const clientHealthScores = clients.map((c) => {
    const byWeek = new Map(c.scorecards.map((s) => [s.weekStart.toISOString(), s]));
    const currentWeekData = byWeek.get(thisWeek.toISOString()) ?? null;
    const last4 = weekStarts.slice(0, 4).map((w) => byWeek.get(w.toISOString()) ?? { revenue: null, leads: null, energyScore: null });
    const t = c.scorecardTargets ?? { leadsTarget: 5 };
    return { id: c.id, breakdown: calculateHealthScore(last4, currentWeekData, c.goals, t) };
  });
  const healthById = new Map(clientHealthScores.map((s) => [s.id, s.breakdown]));

  const weekStart = new Date(thisWeek);

  const upcomingCalls = clients
    .flatMap((c) =>
      c.calls.map((call) => ({ ...call, clientName: c.founderName, clientId: c.id }))
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const checkInsThisWeek = clients.filter((c) => {
    const last = c.checkIns[0];
    return last && new Date(last.createdAt) >= weekStart;
  }).length;

  return (
    <div className="max-w-5xl space-y-12">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#EDEBE6] pb-6">
        <div>
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-1">Pivot Co</p>
          <h1 className="text-5xl font-[300] text-[#1A1917]">HQ</h1>
        </div>
        <p className="text-xs text-[#7a7268] pb-1">
          {now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Active Clients", value: clients.length },
          { label: "Check-ins This Week", value: `${checkInsThisWeek}/${clients.length}`, alert: checkInsThisWeek < clients.length },
          { label: "Open Tasks", value: clients.reduce((s, c) => s + c.tasks.length, 0) },
          { label: "Unread Messages", value: clients.reduce((s, c) => s + c.messages.length, 0) },
        ].map((stat) => (
          <div key={stat.label} className="border-t border-[#1A1917] pt-4">
            <p className="text-[9px] tracking-[0.2em] text-[#7a7268]">{stat.label}</p>
            <p className={`mt-2 text-4xl font-[300] ${"alert" in stat && stat.alert ? "text-[#8C735A]" : "text-[#1A1917]"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Client Health Scores */}
      {clients.length > 0 && (
        <div className="border-t border-[#EDEBE6] pt-8">
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-6">Client Health</p>
          <div className="grid grid-cols-3 gap-5">
            {clients.map((client) => {
              const h = healthById.get(client.id);
              if (!h) return null;
              const color = h.color === "green" ? "#2D6A4F" : h.color === "amber" ? "#8C735A" : "#9B2335";
              return (
                <Link key={client.id} href={`/clients/${client.id}`}
                  className="border border-[#EDEBE6] rounded-xl p-5 hover:border-[#8C735A]/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#1A1917]">{client.founderName}</p>
                      <p className="text-xs text-[#7a7268]">{client.businessName}</p>
                      <p className="text-[9px] tracking-[0.14em] mt-2" style={{ color }}>{h.label}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-[300]" style={{ color }}>{h.total}</span>
                      <p className="text-[9px] text-[#7a7268] mt-0.5">/ 100</p>
                    </div>
                  </div>
                  {client.nextSessionFocus && (
                    <p className="text-[10px] text-[#7a7268] mt-3 italic line-clamp-1 border-t border-[#EDEBE6] pt-3">
                      Next: {client.nextSessionFocus}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Clients table */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-4">Active Clients</p>
        <div className="border border-[#EDEBE6] rounded-xl">
          {clients.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[#7a7268]">
              No clients yet. Add a client to get started.
            </div>
          ) : (
            clients.map((client, i) => {
              const lastCheckIn = client.checkIns[0];
              const checkInThisWeek = lastCheckIn && new Date(lastCheckIn.createdAt) >= weekStart;
              const nextCall = client.calls[0];
              const overdueTasksCount = client.tasks.filter(
                (t) => t.dueDate && new Date(t.dueDate) < now
              ).length;

              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-[#F5F3EF]/30 transition-colors ${
                    i !== clients.length - 1 ? "border-b border-[#EDEBE6]" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm text-[#1A1917]">{client.founderName}</p>
                    <p className="text-xs text-[#7a7268]">{client.businessName}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatusBadge label="Growth Partnership" status="gold" />
                    <span className={`text-xs flex items-center gap-1.5 ${checkInThisWeek ? "text-[#2D6A4F]" : "text-[#8C735A]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${checkInThisWeek ? "bg-[#2D6A4F]" : "bg-[#8C735A]"}`} />
                      {checkInThisWeek ? "Check-in received" : "No check-in yet"}
                    </span>
                    {overdueTasksCount > 0 && (
                      <StatusBadge label={`${overdueTasksCount} overdue`} status="alert" />
                    )}
                    {nextCall && (
                      <span className="text-xs text-[#7a7268]">
                        Next call: {new Date(nextCall.scheduledAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Upcoming calls */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-4">Upcoming Calls</p>
        <div className="border border-[#EDEBE6] rounded-xl divide-y divide-[#EDEBE6]">
          {upcomingCalls.length === 0 ? (
            <div className="px-5 py-6 text-sm text-[#7a7268] text-center">
              No upcoming calls scheduled.
            </div>
          ) : (
            upcomingCalls.map((call) => (
              <div key={call.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#1A1917]">{call.clientName}</p>
                  <p className="text-xs text-[#7a7268] tabular-nums">
                    {new Date(call.scheduledAt).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-[#7a7268]">{call.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
