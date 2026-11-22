import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PhaseControls } from "@/components/founder/PhaseControls";
import { OnboardingTab } from "@/components/founder/OnboardingTab";
import { ClientProfileTabs } from "@/components/founder/ClientProfileTabs";
import { SendInviteButton } from "@/components/founder/SendInviteButton";
import { FeatureToggles } from "@/components/founder/FeatureToggles";
import { ClientCallsSection } from "@/components/founder/ClientCallsSection";
import { MonthlySnapshot } from "@/components/founder/MonthlySnapshot";
import { QuickAddTaskButton } from "@/components/founder/QuickAddTaskButton";
import { computeHealthScore } from "@/lib/health-score";
import Link from "next/link";
import { setClientAccessAction } from "./access-actions";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth("founder");
  const { id } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      goals: { include: { progressNotes: { orderBy: { createdAt: "desc" }, take: 1 } } },
      checkIns: { orderBy: { createdAt: "desc" }, take: 5 },
      calls: { orderBy: { scheduledAt: "desc" }, take: 5 },
      deliverables: { orderBy: { deliveredAt: "desc" } },
      businessContext_: true,
      socialMediaIntake: true,
      onboardingSteps: { orderBy: { step: "asc" } },
      wins: { orderBy: { celebratedAt: "desc" }, take: 20 },
      messages: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!client) notFound();

  const openTasks = client.tasks.filter((t) => !t.completed);
  const intake = client.businessContext_ ?? null;

  const health = computeHealthScore({
    checkIns: client.checkIns.map((c) => ({ createdAt: new Date(c.createdAt) })),
    goals: client.goals.map((g) => ({ progressPercent: g.progressPercent, status: g.status })),
    tasks: client.tasks.map((t) => ({ completed: t.completed, assignedTo: t.assignedTo, createdAt: new Date(t.createdAt) })),
    messages: client.messages.map((m) => ({ createdAt: new Date(m.createdAt) })),
    wins: client.wins.map((w) => ({ createdAt: new Date(w.createdAt) })),
    startDate: new Date(client.startDate),
  });

  const profileContent = (
    <div className="grid grid-cols-3 gap-6">
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Contact</h3>
          <div className="space-y-3">
            {[
              { label: "Email", value: client.email },
              { label: "Phone", value: client.phone || "" },
              { label: "Website", value: client.website || "" },
              {
                label: "Birthday",
                value: client.birthday
                  ? new Date(client.birthday).toLocaleDateString("en-AU", { day: "numeric", month: "long" })
                  : "—",
              },
              {
                label: "Start date",
                value: new Date(client.startDate).toLocaleDateString("en-AU", {
                  day: "numeric", month: "long", year: "numeric",
                }),
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">{label}</p>
                <p className="text-xs text-[#1A1917] mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#EDEBE6]">
            <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-2">Portal access</p>
            <SendInviteButton clientProfileId={client.id} />
          </div>
        </div>
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Billing</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Weekly</p>
              <p className="text-xs text-[#1A1917] mt-0.5">
                {client.monthlyInvestment ? `$${Math.round(client.monthlyInvestment / 4).toLocaleString("en-AU")}/wk` : "-"}
              </p>
            </div>
            {client.nextBillingDate && (
              <div>
                <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Next billing</p>
                <p className="text-xs text-[#1A1917] mt-0.5">
                  {new Date(client.nextBillingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}
                </p>
              </div>
            )}
            {client.billingNotes && (
              <div>
                <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Notes</p>
                <p className="text-xs text-[#7a7268] mt-0.5">{client.billingNotes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Package</p>
          <p className="text-xs text-[#1A1917] mt-0.5">{client.tier}</p>
        </div>
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-1">Portal Features</h3>
          <p className="text-[11px] text-[#b0a89e] mb-5">Control what this client can see in their portal.</p>
          <FeatureToggles
            clientProfileId={client.id}
            hiddenTabs={client.hiddenTabs}
          />
        </div>
        <PhaseControls
          clientProfileId={client.id}
          currentMonth={client.currentMonth}
          currentWeek={client.currentWeek}
          startDate={client.startDate}
        />
      </div>
      <div className="col-span-2 space-y-6">
        {client.nextSessionFocus && (
          <div className="rounded-2xl border border-[#EDEBE6] p-5">
            <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-1">Next Session Focus</p>
            <p className="text-sm text-[#1A1917]">{client.nextSessionFocus}</p>
          </div>
        )}
        {client.businessContext && (
          <div className="rounded-2xl border border-[#EDEBE6] p-5">
            <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-3">Business Context</h3>
            <p className="text-sm text-[#7a7268] leading-6 whitespace-pre-wrap">{client.businessContext}</p>
          </div>
        )}
        {(client.personalityNotes || client.communicationStyle) && (
          <div className="rounded-2xl border border-[#EDEBE6] p-5">
            <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-3">Founder Notes</h3>
            {client.personalityNotes && (
              <div className="mb-3">
                <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-1">Personality</p>
                <p className="text-sm text-[#7a7268] leading-6">{client.personalityNotes}</p>
              </div>
            )}
            {client.communicationStyle && (
              <div>
                <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-1">Communication style</p>
                <p className="text-sm text-[#7a7268] leading-6">{client.communicationStyle}</p>
              </div>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Goals</h3>
          {client.goals.length === 0 ? (
            <p className="text-sm text-[#b0a89e]">No goals set yet.</p>
          ) : (
            <div className="space-y-4">
              {client.goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-[#1A1917]">{goal.title}</p>
                    <span className="text-xs text-[#b0a89e] tabular-nums">{goal.progressPercent}%</span>
                  </div>
                  <div className="h-px bg-[#EDEBE6]">
                    <div className="h-px bg-[#8C735A] transition-all" style={{ width: `${goal.progressPercent}%` }} />
                  </div>
                  {goal.baselineNote && (
                    <p className="text-xs text-[#b0a89e] mt-1">{goal.baselineNote}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <MonthlySnapshot
          currentMonth={client.currentMonth}
          checkIns={client.checkIns.map((c) => ({ monthNumber: c.monthNumber, energyScore: c.energyScore, createdAt: new Date(c.createdAt) }))}
          goals={client.goals.map((g) => ({ title: g.title, progressPercent: g.progressPercent, status: g.status }))}
          wins={client.wins.map((w) => ({ title: w.title, celebratedAt: new Date(w.celebratedAt) }))}
          tasks={client.tasks.map((t) => ({ completed: t.completed, completedAt: t.completedAt, monthNumber: t.monthNumber }))}
        />

        {client.wins.length > 0 && (
          <div className="rounded-2xl border border-[#EDEBE6] p-5">
            <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Win Log</h3>
            <div className="space-y-2">
              {client.wins.slice(0, 6).map((win) => (
                <div key={win.id} className="flex items-start gap-2">
                  <span className="text-[10px] mt-0.5 text-[#8C735A]">✦</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#1A1917]">{win.title}</p>
                    {win.description && <p className="text-[10px] text-[#b0a89e] mt-0.5">{win.description}</p>}
                  </div>
                  <span className="text-[10px] text-[#b0a89e] shrink-0">
                    {new Date(win.celebratedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Open Tasks ({openTasks.length})</h3>
            <QuickAddTaskButton clientProfileId={client.id} />
          </div>
          {openTasks.length === 0 ? (
            <p className="text-sm text-[#b0a89e]">No open tasks.</p>
          ) : (
            <div className="space-y-2">
              {openTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-[#EDEBE6] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-1 rounded-full ${task.priority === "high" ? "bg-[#9B2335]" : task.priority === "medium" ? "bg-[#8C735A]" : "bg-[#2D6A4F]"}`} />
                    <p className="text-xs text-[#1A1917]">{task.title}</p>
                  </div>
                  <span className="text-[10px] text-[#b0a89e]">{task.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <ClientCallsSection
          clientId={client.id}
          calls={client.calls.map((c) => ({
            id: c.id,
            title: c.title,
            scheduledAt: c.scheduledAt.toISOString(),
            completedAt: c.completedAt?.toISOString() ?? null,
          }))}
        />
        <div className="rounded-2xl border border-[#EDEBE6] p-5">
          <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Recent Check-ins</h3>
          {client.checkIns.length === 0 ? (
            <p className="text-sm text-[#b0a89e]">No check-ins submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {client.checkIns.map((checkin) => (
                <div key={checkin.id} className="border-b border-[#EDEBE6] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#b0a89e]">Month {checkin.monthNumber}, Week {checkin.weekNumber}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#b0a89e]">Energy</span>
                      <span className="text-xs text-[#1A1917] tabular-nums">{checkin.energyScore}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#7a7268] line-clamp-2">{checkin.completed}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const onboardingContent = (
    <OnboardingTab
      clientId={client.id}
      steps={client.onboardingSteps}
      intake={intake}
      firstCallNotes={null}
      welcomeVideoUrl={client.welcomeVideoUrl ?? null}
      kickoffCallUrl={client.kickoffCallUrl ?? null}
      packageType={client.package}
      socialMediaIntake={client.socialMediaIntake ?? null}
    />
  );

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/clients" className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors">
              Clients
            </Link>
            <span className="text-[#EDEBE6]">/</span>
            <span className="text-xs text-[#7a7268]">{client.founderName}</span>
          </div>
          <h1 className="text-4xl font-[300] text-[#1A1917]">
            {client.founderName}
          </h1>
          <p className="mt-1 text-sm text-[#7a7268]">{client.businessName}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <Link
            href={`/clients/${client.id}/roadmap`}
            className="px-4 py-2 rounded-xl border border-[#EDEBE6] text-[#7a7268] text-[10px] tracking-[0.12em] hover:border-[#8C735A]/40 transition-colors"
          >
            Roadmap
          </Link>
          <Link
            href={`/social-planning/${client.id}`}
            className="px-4 py-2 rounded-xl border border-[#EDEBE6] text-[#7a7268] text-[10px] tracking-[0.12em] hover:border-[#8C735A]/40 transition-colors"
          >
            Content Calendar
          </Link>
          <Link
            href={`/clients/${client.id}/questionnaires`}
            className="px-4 py-2 rounded-xl border border-[#EDEBE6] text-[#7a7268] text-[10px] tracking-[0.12em] hover:border-[#8C735A]/40 transition-colors"
          >
            Questionnaires
          </Link>
          <Link
            href={`/clients/${client.id}/edit`}
            className="px-4 py-2 rounded-xl border border-[#EDEBE6] text-[#7a7268] text-[10px] tracking-[0.12em] hover:border-[#8C735A]/40 transition-colors"
          >
            Edit details
          </Link>
          <form action={async () => { "use server"; await setClientAccessAction(client.id, !client.isActive); }}>
            <button
              type="submit"
              className={`px-4 py-2 rounded-xl border text-[10px] tracking-[0.12em] transition-colors ${
                client.isActive
                  ? "border-red-200 text-red-500 hover:border-red-400"
                  : "border-green-200 text-green-600 hover:border-green-400"
              }`}
            >
              {client.isActive ? "Lock out" : "Restore access"}
            </button>
          </form>
          <a
            href={`/api/founder/preview-client/${client.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl border border-[#EDEBE6] text-[#7a7268] text-[10px] tracking-[0.12em] hover:border-[#8C735A]/40 transition-colors"
          >
            View portal ↗
          </a>
          <span
            className="px-3 py-1.5 rounded-xl text-[10px] tracking-[0.12em] font-medium"
            style={{ color: health.color, background: health.color + "15", border: `1px solid ${health.color}30` }}
          >
            {health.label} · {health.total}
          </span>
          <StatusBadge label={client.tier === "GROWTH" ? "Growth Partnership" : client.tier} status="gold" />
          <StatusBadge label={`Month ${client.currentMonth}, Week ${client.currentWeek}`} status="active" />
        </div>
      </div>

      <ClientProfileTabs
        profileContent={profileContent}
        onboardingContent={onboardingContent}
        hasOnboardingAlert={!client.businessContext_?.submittedAt}
      />
    </div>
  );
}
