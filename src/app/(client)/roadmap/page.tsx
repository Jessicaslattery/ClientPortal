import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

type RoadmapWeek = { week: number; focus: string; priority: string; milestone: string };

export default async function RoadmapPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const roadmap = await prisma.clientRoadmap.findFirst({
    where: { clientProfileId: session.clientProfileId, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  const client = await prisma.clientProfile.findUnique({
    where: { id: session.clientProfileId },
    select: { founderName: true, startDate: true },
  });

  if (!roadmap) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
            90-Day Roadmap
          </h1>
          <p className="mt-1.5 text-sm text-[#5C5550]">Your personalised 90-day business plan</p>
        </div>
        <div className="rounded-3xl border border-[#E8E2D9] px-8 py-16 text-center">
          <p className="font-display text-2xl font-thin tracking-wide text-[#1A1714]">Roadmap coming soon</p>
          <p className="mt-2 text-sm text-[#5C5550]">
            Jess will build your 90-day roadmap in your first session.
          </p>
        </div>
      </div>
    );
  }

  let weeks: RoadmapWeek[] = [];
  try { weeks = JSON.parse(roadmap.weeksJson); } catch { weeks = []; }

  const phases = [
    { label: "Phase 1", subLabel: "Month 1", focus: roadmap.phase1Focus, weeks: weeks.filter((w) => w.week <= 4), color: "#C8B89A" },
    { label: "Phase 2", subLabel: "Month 2", focus: roadmap.phase2Focus, weeks: weeks.filter((w) => w.week >= 5 && w.week <= 8), color: "#9B7DB8" },
    { label: "Phase 3", subLabel: "Month 3", focus: roadmap.phase3Focus, weeks: weeks.filter((w) => w.week >= 9), color: "#2D6A4F" },
  ];

  const startDate = new Date(roadmap.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 84);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          {roadmap.title}
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          {startDate.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          {" — "}
          {endDate.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {phases.map((phase) => (
        <div key={phase.label} className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-xl font-thin tracking-widest text-[#1A1714] uppercase">
              {phase.label}
            </h2>
            <span className="text-xs text-[#8C8277] tracking-wide">{phase.subLabel}</span>
            {phase.focus && (
              <span
                className="px-3 py-0.5 rounded-full text-[10px] tracking-[0.1em] uppercase font-medium text-white"
                style={{ backgroundColor: phase.color }}
              >
                {phase.focus}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {phase.weeks.map((w) => {
              const weekStart = new Date(startDate);
              weekStart.setDate(weekStart.getDate() + (w.week - 1) * 7);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              const hasContent = w.focus || w.priority || w.milestone;

              return (
                <div
                  key={w.week}
                  className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-5"
                  style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-thin" style={{ color: phase.color }}>
                        Week {w.week}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8C8277]">
                      {weekStart.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} – {weekEnd.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </span>
                  </div>

                  {!hasContent ? (
                    <p className="text-xs text-[#8C8277] italic">Not yet planned</p>
                  ) : (
                    <div className="space-y-3">
                      {w.focus && (
                        <div>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Weekly focus</p>
                          <p className="text-sm text-[#1A1714] leading-relaxed">{w.focus}</p>
                        </div>
                      )}
                      {w.priority && (
                        <div>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Top priority</p>
                          <p className="text-sm text-[#5C5550] leading-relaxed">{w.priority}</p>
                        </div>
                      )}
                      {w.milestone && (
                        <div className="rounded-xl bg-[#F5F2ED] px-3 py-2">
                          <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-0.5">Milestone</p>
                          <p className="text-xs text-[#1A1714]">{w.milestone}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
