import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AgentDraftCard } from "@/components/founder/AgentDraftCard";

export default async function AgentWorkspacePage() {
  await requireAuth("founder");

  const drafts = await prisma.agentDraft.findMany({
    where: { status: "pending" },
    include: { clientProfile: true },
    orderBy: { createdAt: "desc" },
  });

  const approved = await prisma.agentDraft.findMany({
    where: { status: "approved" },
    include: { clientProfile: true },
    orderBy: { approvedAt: "desc" },
    take: 10,
  });

  const typeOrder = [
    "content_plan",
    "pulse-message",
    "pre-call-brief",
    "session-summary",
    "social-plan",
    "progress-report",
    "diagnostic-report",
  ];

  const groupedDrafts = typeOrder.reduce<Record<string, typeof drafts>>(
    (acc, type) => {
      const items = drafts.filter((d) => d.type === type);
      if (items.length > 0) acc[type] = items;
      return acc;
    },
    {}
  );

  const typeLabels: Record<string, string> = {
    "content_plan": "Content Plans",
    "pulse-message": "Pulse Messages",
    "pre-call-brief": "Pre-call Briefs",
    "session-summary": "Session Summaries",
    "social-plan": "Social Plans",
    "progress-report": "Progress Reports",
    "diagnostic-report": "Diagnostic Reports",
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Agent Workspace
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          Review and approve AI-generated drafts before they reach clients
        </p>
      </div>

      {/* Pending drafts */}
      {drafts.length === 0 ? (
        <div className="rounded-3xl border border-[#E8E2D9] px-8 py-16 text-center">
          <p className="font-display text-2xl font-thin tracking-wide text-[#1A1714]">All caught up</p>
          <p className="mt-2 text-sm text-[#5C5550]">No drafts awaiting review.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDrafts).map(([type, items]) => (
            <div key={type}>
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8277] mb-4">
                {typeLabels[type] ?? type} · {items.length} pending
              </h2>
              <div className="space-y-4">
                {items.map((draft) => (
                  <AgentDraftCard key={draft.id} draft={draft} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recently approved */}
      {approved.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8277] mb-4">
            Recently Approved
          </h2>
          <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
            {approved.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm text-[#1A1714]">{draft.title}</p>
                  <p className="text-xs text-[#5C5550]">{draft.clientProfile.founderName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-[#2D6A4F] tracking-wide">Approved</span>
                  <span className="text-xs text-[#8C8277]">
                    {draft.approvedAt
                      ? new Date(draft.approvedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
