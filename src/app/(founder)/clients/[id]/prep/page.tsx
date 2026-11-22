import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SessionPrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth("founder");
  const { id } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    include: {
      tasks: { where: { completed: false }, orderBy: { createdAt: "desc" } },
      goals: { where: { status: "active" }, include: { progressNotes: { orderBy: { createdAt: "desc" }, take: 1 } } },
      checkIns: { orderBy: { createdAt: "desc" }, take: 2 },
      calls: { orderBy: { scheduledAt: "desc" }, take: 5 },
      sessionSummaries: { orderBy: { date: "desc" }, take: 3 },
      wins: { orderBy: { celebratedAt: "desc" }, take: 5 },
    },
  });

  if (!client) notFound();

  const lastCheckIn = client.checkIns[0];
  const prevCheckIn = client.checkIns[1];
  const openFounderTasks = client.tasks.filter((t) => t.assignedTo === "founder");
  const openClientTasks = client.tasks.filter((t) => t.assignedTo !== "founder");
  const nextCall = client.calls.find((c) => !c.completedAt && new Date(c.scheduledAt) >= new Date());
  const lastCall = client.calls.find((c) => c.completedAt || new Date(c.scheduledAt) < new Date());

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href={`/clients/${id}`} className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors">
            {client.founderName}
          </Link>
          <span className="text-[#EDEBE6]">/</span>
          <span className="text-xs text-[#7a7268]">Session prep</span>
        </div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Session Prep</h1>
        {nextCall && (
          <p className="mt-1 text-sm text-[#7a7268]">
            {nextCall.title} · {new Date(nextCall.scheduledAt).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Last check-in */}
        <div className="col-span-2 rounded-2xl border border-[#EDEBE6] p-5">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Last check-in</h2>
          {lastCheckIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Month {lastCheckIn.monthNumber} · Week {lastCheckIn.weekNumber}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#b0a89e]">Energy</span>
                  <span className={`text-sm font-medium ${lastCheckIn.energyScore >= 7 ? "text-[#2D6A4F]" : lastCheckIn.energyScore >= 5 ? "text-[#8C735A]" : "text-[#9B2335]"}`}>
                    {lastCheckIn.energyScore}/10
                  </span>
                </div>
                {prevCheckIn && (
                  <span className="text-[10px] text-[#b0a89e]">
                    (prev: {prevCheckIn.energyScore}/10)
                  </span>
                )}
              </div>
              {[
                { label: "Completed", value: lastCheckIn.completed },
                { label: "Didn't get to", value: lastCheckIn.notCompleted },
                { label: "Stuck on", value: lastCheckIn.stuck },
                { label: "Energy note", value: lastCheckIn.energyNote },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label}>
                  <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-0.5">{row.label}</p>
                  <p className="text-sm text-[#1A1917] leading-6">{row.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#b0a89e]">No check-ins submitted yet.</p>
          )}
        </div>

        {/* Open tasks */}
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">
            Open tasks: your side ({openFounderTasks.length})
          </h2>
          {openFounderTasks.length === 0 ? (
            <p className="text-xs text-[#b0a89e]">All clear.</p>
          ) : (
            <div className="space-y-2">
              {openFounderTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${task.priority === "high" ? "bg-[#9B2335]" : task.priority === "medium" ? "bg-[#8C735A]" : "bg-[#2D6A4F]"}`} />
                  <div>
                    <p className="text-xs text-[#1A1917]">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-[10px] text-[#b0a89e]">Due {new Date(task.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client tasks */}
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">
            Open tasks: client side ({openClientTasks.length})
          </h2>
          {openClientTasks.length === 0 ? (
            <p className="text-xs text-[#b0a89e]">All clear.</p>
          ) : (
            <div className="space-y-2">
              {openClientTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${task.priority === "high" ? "bg-[#9B2335]" : task.priority === "medium" ? "bg-[#8C735A]" : "bg-[#2D6A4F]"}`} />
                  <p className="text-xs text-[#1A1917]">{task.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Active goals ({client.goals.length})</h2>
          {client.goals.length === 0 ? (
            <p className="text-xs text-[#b0a89e]">No active goals.</p>
          ) : (
            <div className="space-y-3">
              {client.goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[#1A1917]">{goal.title}</p>
                    <span className="text-[10px] text-[#b0a89e] tabular-nums">{goal.progressPercent}%</span>
                  </div>
                  <div className="h-px bg-[#EDEBE6]">
                    <div className="h-px bg-[#8C735A]" style={{ width: `${goal.progressPercent}%` }} />
                  </div>
                  {goal.progressNotes[0] && (
                    <p className="text-[10px] text-[#b0a89e] mt-1 italic">{goal.progressNotes[0].note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent wins */}
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Recent wins</h2>
          {client.wins.length === 0 ? (
            <p className="text-xs text-[#b0a89e]">No wins logged yet.</p>
          ) : (
            <div className="space-y-2">
              {client.wins.map((win) => (
                <div key={win.id} className="flex items-start gap-2">
                  <span className="text-[10px] mt-0.5">✦</span>
                  <div>
                    <p className="text-xs text-[#1A1917]">{win.title}</p>
                    <p className="text-[10px] text-[#b0a89e]">
                      {new Date(win.celebratedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session notes from last call */}
      {lastCall && (lastCall.summaryContent || lastCall.keyDecisions || lastCall.nextSteps) && (
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Last session notes</h2>
          <p className="text-[10px] text-[#b0a89e] mb-3">
            {lastCall.title} · {new Date(lastCall.scheduledAt).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}
          </p>
          {lastCall.summaryContent && (
            <div className="mb-3">
              <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-1">Summary</p>
              <p className="text-sm text-[#7a7268] leading-6 whitespace-pre-wrap">{lastCall.summaryContent}</p>
            </div>
          )}
          {lastCall.keyDecisions && (
            <div className="mb-3">
              <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-1">Key decisions</p>
              <p className="text-sm text-[#7a7268] leading-6 whitespace-pre-wrap">{lastCall.keyDecisions}</p>
            </div>
          )}
          {lastCall.nextSteps && (
            <div>
              <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-1">Next steps from last session</p>
              <p className="text-sm text-[#7a7268] leading-6 whitespace-pre-wrap">{lastCall.nextSteps}</p>
            </div>
          )}
        </div>
      )}

      {/* Next session focus */}
      {client.nextSessionFocus && (
        <div className="rounded-2xl border border-[#C8B89A]/40 bg-[#FDFCF9] p-5">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-2">Session focus</h2>
          <p className="text-sm text-[#1A1917] leading-6">{client.nextSessionFocus}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href={`/clients/${id}`}
          className="px-5 py-2.5 rounded-2xl border border-[#EDEBE6] text-xs tracking-[0.1em] text-[#7a7268] hover:border-[#8C735A]/40 transition-colors"
        >
          ← Back to profile
        </Link>
        <Link
          href={`/clients/${id}/calls`}
          className="px-5 py-2.5 rounded-2xl bg-[#1A1917] text-white text-xs tracking-[0.1em] hover:bg-[#2C2520] transition-colors"
        >
          Add call notes
        </Link>
      </div>
    </div>
  );
}
