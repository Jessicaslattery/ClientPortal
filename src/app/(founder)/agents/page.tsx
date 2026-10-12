import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AgentHub } from "@/components/founder/AgentHub";

export default async function AgentsPage() {
  await requireAuth("founder");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const clients = await prisma.clientProfile.findMany({
    select: { id: true, founderName: true, businessName: true },
    orderBy: { founderName: "asc" },
  });

  // Recent outputs per agent type
  const [
    scribeDrafts,
    execOutputs,
    progressDrafts,
    contentDrafts,
    prepDrafts,
    granolaSyncLogs,
    onboardingDrafts,
    pulseDrafts,
    pendingCount,
    onboardingSteps,
  ] = await Promise.all([
    // Scribe — session_summary drafts
    prisma.agentDraft.findMany({
      where: { type: { in: ["session-summary", "session_summary"] }, createdAt: { gte: thirtyDaysAgo } },
      include: { clientProfile: { select: { founderName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Exec assistant outputs
    prisma.agentOutput.findMany({
      where: { type: "founder_briefing" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Progress reports
    prisma.agentDraft.findMany({
      where: { type: { in: ["progress-report", "progress_report"] }, createdAt: { gte: thirtyDaysAgo } },
      include: { clientProfile: { select: { founderName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Content plans
    prisma.agentDraft.findMany({
      where: { type: { in: ["content_plan", "social-plan", "content-plan"] }, createdAt: { gte: thirtyDaysAgo } },
      include: { clientProfile: { select: { founderName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Prep briefs
    prisma.agentDraft.findMany({
      where: { type: "prep-brief", createdAt: { gte: thirtyDaysAgo } },
      include: { clientProfile: { select: { founderName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Granola sync logs
    prisma.granolaSyncLog.findMany({
      orderBy: { runAt: "desc" },
      take: 5,
    }),
    // Onboarding drafts
    prisma.agentDraft.findMany({
      where: { type: "onboarding-message", createdAt: { gte: thirtyDaysAgo } },
      include: { clientProfile: { select: { founderName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Pulse messages
    prisma.agentDraft.findMany({
      where: { type: "pulse-message", createdAt: { gte: thirtyDaysAgo } },
      include: { clientProfile: { select: { founderName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Total pending drafts (agent workspace count)
    prisma.agentDraft.count({ where: { status: "pending" } }),
    // Onboarding steps per client
    prisma.onboardingStep.findMany({
      include: { clientProfile: { select: { founderName: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Serialise dates to strings for client components
  function serialise<T extends Record<string, unknown>>(items: T[]) {
    return items.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([k, v]) => [
          k,
          v instanceof Date ? v.toISOString() : v,
        ])
      )
    ) as Array<Record<string, string | number | boolean | null | Record<string, unknown>>>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Agent Hub
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          All AI agents · {pendingCount} draft{pendingCount !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      <AgentHub
        clients={clients}
        scribeDrafts={scribeDrafts.map((d) => ({
          id: d.id, title: d.title, status: d.status,
          createdAt: d.createdAt.toISOString(),
          clientName: d.clientProfile.founderName,
        }))}
        execOutputs={execOutputs.map((o) => ({
          id: o.id, createdAt: o.createdAt.toISOString(),
          preview: o.content.slice(0, 120),
        }))}
        progressDrafts={progressDrafts.map((d) => ({
          id: d.id, title: d.title, status: d.status,
          createdAt: d.createdAt.toISOString(),
          clientName: d.clientProfile.founderName,
        }))}
        contentDrafts={contentDrafts.map((d) => ({
          id: d.id, title: d.title, status: d.status,
          createdAt: d.createdAt.toISOString(),
          clientName: d.clientProfile.founderName,
        }))}
        prepDrafts={prepDrafts.map((d) => ({
          id: d.id, title: d.title, status: d.status,
          createdAt: d.createdAt.toISOString(),
          clientName: d.clientProfile.founderName,
        }))}
        granolaSyncLogs={granolaSyncLogs.map((l) => ({
          id: l.id, runAt: l.runAt.toISOString(),
          meetingsFound: l.meetingsFound, transcriptsSaved: l.transcriptsSaved,
          unmatched: l.unmatched, errors: l.errors,
        }))}
        onboardingDrafts={onboardingDrafts.map((d) => ({
          id: d.id, title: d.title, status: d.status,
          createdAt: d.createdAt.toISOString(),
          clientName: d.clientProfile.founderName,
        }))}
        pulseDrafts={pulseDrafts.map((d) => ({
          id: d.id, title: d.title, status: d.status,
          createdAt: d.createdAt.toISOString(),
          clientName: d.clientProfile.founderName,
        }))}
        onboardingSteps={onboardingSteps.map((s) => ({
          id: s.id, step: s.step, status: s.status,
          createdAt: s.createdAt.toISOString(),
          completedAt: s.completedAt?.toISOString() ?? null,
          clientName: s.clientProfile.founderName,
        }))}
      />
    </div>
  );
}
