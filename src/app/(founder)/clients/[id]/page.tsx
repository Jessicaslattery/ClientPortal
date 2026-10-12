import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GenerateDraftPanel } from "@/components/founder/GenerateDraftPanel";
import { ScribeManualTrigger } from "@/components/founder/ScribeManualTrigger";
import { PhaseControls } from "@/components/founder/PhaseControls";
import { OnboardingTab } from "@/components/founder/OnboardingTab";
import { ClientProfileTabs } from "@/components/founder/ClientProfileTabs";
import { CallPrepSection } from "@/components/founder/CallPrepSection";
import { SendInviteButton } from "@/components/founder/SendInviteButton";
import Link from "next/link";


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
      agentDrafts: { where: { status: "pending" }, orderBy: { createdAt: "desc" } },
      businessContext_: true,
      onboardingSteps: { orderBy: { step: "asc" } },
    },
  });

  // Most recent approved prep brief (founder-only — never shown to client)
  const approvedPrepBrief = client
    ? await prisma.agentDraft.findFirst({
        where: { clientProfileId: client.id, type: "prep-brief", status: "approved" },
        orderBy: { approvedAt: "desc" },
      })
    : null;

  if (!client) notFound();

  const openTasks = client.tasks.filter((t) => !t.completed);

  // Extract founderNote from step 3 draft
  let firstCallNotes: string | null = null;
  const step3 = client.onboardingSteps.find((s) => s.step === 3);
  if (step3?.agentDraftId) {
    const step3Draft = await prisma.agentDraft.findUnique({
      where: { id: step3.agentDraftId },
      select: { content: true },
    });
    if (step3Draft) {
      try {
        const parsed = JSON.parse(step3Draft.content) as { founderNote?: string };
        firstCallNotes = parsed.founderNote ?? null;
      } catch {
        // ignore
      }
    }
  }

  const intake = client.businessContext_
    ? {
        submittedAt: client.businessContext_.submittedAt,
        biggestChallenge: client.businessContext_.biggestChallenge,
        currentRevenue: client.businessContext_.currentRevenue,
        revenueGoal: client.businessContext_.revenueGoal,
        goalOne: client.businessContext_.goalOne,
        goalTwo: client.businessContext_.goalTwo,
        goalThree: client.businessContext_.goalThree,
      }
    : null;

  const profileContent = (
    <div className="grid grid-cols-3 gap-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">Contact</h3>
          <div className="space-y-3">
            {[
              { label: "Email", value: client.email },
              { label: "Phone", value: client.phone || "—" },
              { label: "Website", value: client.website || "—" },
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
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">{label}</p>
                <p className="text-xs text-[#1A1714] mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#E8E2D9]">
            <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Portal access</p>
            <SendInviteButton clientProfileId={client.id} />
          </div>
        </div>
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">Billing</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Weekly</p>
              <p className="text-xs text-[#1A1714] mt-0.5">
                {client.monthlyInvestment ? `$${Math.round(client.monthlyInvestment / 4).toLocaleString("en-AU")}/wk` : "-"}
              </p>
            </div>
            {client.nextBillingDate && (
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Next billing</p>
                <p className="text-xs text-[#1A1714] mt-0.5">
                  {new Date(client.nextBillingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}
                </p>
              </div>
            )}
            {client.billingNotes && (
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Notes</p>
                <p className="text-xs text-[#5C5550] mt-0.5">{client.billingNotes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Package</p>
          <p className="text-xs text-[#1A1714] mt-0.5">{client.tier}</p>
        </div>
        <PhaseControls
          clientProfileId={client.id}
          currentMonth={client.currentMonth}
          currentWeek={client.currentWeek}
          startDate={client.startDate}
        />
      </div>
      <div className="col-span-2 space-y-6">
        {approvedPrepBrief && (
          <CallPrepSection brief={approvedPrepBrief} />
        )}
        {client.nextSessionFocus && (
          <div className="rounded-3xl border border-[#E8E2D9] p-5">
            <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Next Session Focus</p>
            <p className="text-sm text-[#1A1714]">{client.nextSessionFocus}</p>
          </div>
        )}
        {client.businessContext && (
          <div className="rounded-3xl border border-[#E8E2D9] p-5">
            <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">Business Context</h3>
            <p className="text-sm text-[#5C5550] leading-6 whitespace-pre-wrap">{client.businessContext}</p>
          </div>
        )}
        {(client.personalityNotes || client.communicationStyle) && (
          <div className="rounded-3xl border border-[#E8E2D9] p-5">
            <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">Founder Notes</h3>
            {client.personalityNotes && (
              <div className="mb-3">
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Personality</p>
                <p className="text-sm text-[#5C5550] leading-6">{client.personalityNotes}</p>
              </div>
            )}
            {client.communicationStyle && (
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Communication style</p>
                <p className="text-sm text-[#5C5550] leading-6">{client.communicationStyle}</p>
              </div>
            )}
          </div>
        )}
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">Goals</h3>
          {client.goals.length === 0 ? (
            <p className="text-sm text-[#8C8277]">No goals set yet.</p>
          ) : (
            <div className="space-y-4">
              {client.goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-[#1A1714]">{goal.title}</p>
                    <span className="text-xs text-[#C8B89A] tabular-nums">{goal.progressPercent}%</span>
                  </div>
                  <div className="h-px bg-[#E8E2D9]">
                    <div className="h-px bg-[#C8B89A] transition-all" style={{ width: `${goal.progressPercent}%` }} />
                  </div>
                  {goal.baselineNote && (
                    <p className="text-xs text-[#8C8277] mt-1">{goal.baselineNote}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Open Tasks ({openTasks.length})</h3>
          </div>
          {openTasks.length === 0 ? (
            <p className="text-sm text-[#8C8277]">No open tasks.</p>
          ) : (
            <div className="space-y-2">
              {openTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-[#E8E2D9] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-1 rounded-full ${task.priority === "high" ? "bg-[#9B2335]" : task.priority === "medium" ? "bg-[#C8B89A]" : "bg-[#2D6A4F]"}`} />
                    <p className="text-xs text-[#1A1714]">{task.title}</p>
                  </div>
                  <span className="text-[10px] text-[#8C8277]">{task.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <ScribeManualTrigger clientId={client.id} />
        <GenerateDraftPanel
          clientProfileId={client.id}
          calls={client.calls.map((c) => ({
            id: c.id,
            title: c.title,
            scheduledAt: c.scheduledAt,
            completedAt: c.completedAt,
          }))}
        />
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">Recent Check-ins</h3>
          {client.checkIns.length === 0 ? (
            <p className="text-sm text-[#8C8277]">No check-ins submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {client.checkIns.map((checkin) => (
                <div key={checkin.id} className="border-b border-[#E8E2D9] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#C8B89A]">Month {checkin.monthNumber}, Week {checkin.weekNumber}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#8C8277]">Energy</span>
                      <span className="text-xs text-[#1A1714] tabular-nums">{checkin.energyScore}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5C5550] line-clamp-2">{checkin.completed}</p>
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
      firstCallNotes={firstCallNotes}
    />
  );

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/clients" className="text-xs text-[#8C8277] hover:text-[#5C5550] transition-colors tracking-wide">
              Clients
            </Link>
            <span className="text-[#E8E2D9]">/</span>
            <span className="text-xs text-[#5C5550]">{client.founderName}</span>
          </div>
          <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
            {client.founderName}
          </h1>
          <p className="mt-1 text-sm text-[#5C5550]">{client.businessName}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <Link
            href={`/clients/${client.id}/roadmap`}
            className="px-4 py-2 rounded-2xl border border-[#E8E2D9] text-[#5C5550] text-[10px] tracking-[0.12em] uppercase hover:border-[#C8B89A] transition-colors"
          >
            Roadmap
          </Link>
          <Link
            href={`/clients/${client.id}/content-calendar`}
            className="px-4 py-2 rounded-2xl border border-[#E8E2D9] text-[#5C5550] text-[10px] tracking-[0.12em] uppercase hover:border-[#C8B89A] transition-colors"
          >
            Content Calendar
          </Link>
          <Link
            href={`/clients/${client.id}/edit`}
            className="px-4 py-2 rounded-2xl border border-[#E8E2D9] text-[#5C5550] text-[10px] tracking-[0.12em] uppercase hover:border-[#C8B89A] transition-colors"
          >
            Edit details
          </Link>
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
