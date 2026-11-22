import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ClientTimeline } from "@/components/client/ClientTimeline";

const CORE_MONTHS = [
  {
    month: 1,
    title: "Diagnose",
    theme: "Understanding your business from the inside",
    weeks: [
      "Business audit & context setting",
      "Friction mapping & bottleneck identification",
      "Priority sequencing",
      "Content direction framework",
    ],
    deliverables: [
      "Pivot Diagnostic Report",
      "Friction Map",
      "Priority Sequence",
      "Content Direction Framework",
    ],
  },
  {
    month: 2,
    title: "Refine",
    theme: "Building the systems that sustain growth",
    weeks: [
      "Client experience design",
      "Retention architecture",
      "Emotional customer journey mapping",
      "Implementation planning",
    ],
    deliverables: [
      "Client Experience Blueprint",
      "Retention Architecture",
      "Emotional Customer Journey Map",
    ],
  },
  {
    month: 3,
    title: "Implement",
    theme: "Putting it all into motion",
    weeks: [
      "Operational systems build",
      "Founder dependency audit",
      "Premiumisation layer",
      "Transformation summary",
    ],
    deliverables: [
      "Operational Systems Plan",
      "Founder Dependency Audit",
      "Premiumisation Layer Document",
      "Transformation Summary",
    ],
  },
];

export default async function JourneyPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { id: session.clientProfileId },
    include: {
      deliverables: { orderBy: { deliveredAt: "asc" } },
      calls: { where: { completedAt: { not: null } }, orderBy: { scheduledAt: "asc" } },
      wins: { orderBy: { celebratedAt: "desc" }, take: 20 },
      goals: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!profile) redirect("/login");

  const isCore = profile.tier === "CORE";

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-1">Your story</p>
        <h1 className="text-4xl font-[200] text-[#1A1917]">My Journey</h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">
          "Growth Partnership" · Started{" "}
          {new Date(profile.startDate).toLocaleDateString("en-AU", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Timeline */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-6">Your story so far</p>
        <ClientTimeline
          startDate={new Date(profile.startDate)}
          currentMonth={profile.currentMonth}
          wins={profile.wins.map((w) => ({ title: w.title, celebratedAt: new Date(w.celebratedAt) }))}
          goals={profile.goals.map((g) => ({ title: g.title, progressPercent: g.progressPercent, createdAt: new Date(g.createdAt) }))}
          calls={profile.calls.map((c) => ({ title: c.title, scheduledAt: new Date(c.scheduledAt), completedAt: c.completedAt ? new Date(c.completedAt) : null }))}
        />
      </div>

      {/* Journey milestones */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-[#FFFFFF]" />

        <div className="space-y-8 pl-12">
          {isCore &&
            CORE_MONTHS.map((m) => {
              const isComplete = profile.currentMonth > m.month;
              const isCurrent = profile.currentMonth === m.month;
              const isFuture = profile.currentMonth < m.month;

              return (
                <div key={m.month} className="relative">
                  {/* Node */}
                  <div
                    className={`absolute -left-[2.35rem] top-1 w-3 h-3 rounded-full border ${
                      isComplete
                        ? "bg-[#C8B89A] border-[#C8B89A]"
                        : isCurrent
                        ? "bg-[#F5F3EF] border-[#C8B89A] ring-4 ring-[#C8B89A]/15"
                        : "bg-[#F5F3EF] border-[#EDEBE6]"
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`border p-5 ${
                      isCurrent
                        ? "border-[#C8B89A]/30"
                        : isComplete
                        ? "border-[#EDEBE6]"
                        : "border-[#EDEBE6] opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] tracking-[0.15em] uppercase text-[#b0a89e]">
                            Month {m.month}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] tracking-[0.12em] uppercase text-[#C8B89A]">
                              Current
                            </span>
                          )}
                          {isComplete && (
                            <span className="text-[9px] tracking-[0.12em] uppercase text-[#2D6A4F]">
                              Complete
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-[300] text-[#1A1917]">
                          {m.title}
                        </h3>
                        <p className="text-xs text-[#7a7268] mt-0.5">{m.theme}</p>
                      </div>
                    </div>

                    {/* Week breakdown */}
                    {(isCurrent || isComplete) && (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div>
                          <p className="text-[10px] tracking-[0.12em] uppercase text-[#b0a89e] mb-2">
                            Weekly focus
                          </p>
                          <div className="space-y-1.5">
                            {m.weeks.map((week, wi) => {
                              const weekNum = wi + 1;
                              const isWeekDone =
                                isComplete || (isCurrent && profile.currentWeek > weekNum);
                              const isWeekCurrent =
                                isCurrent && profile.currentWeek === weekNum;
                              return (
                                <div key={wi} className="flex items-center gap-2">
                                  <div
                                    className={`w-1 h-1 rounded-full ${
                                      isWeekDone
                                        ? "bg-[#C8B89A]"
                                        : isWeekCurrent
                                        ? "bg-[#C8B89A]"
                                        : "bg-[#EDEBE6]"
                                    }`}
                                  />
                                  <span
                                    className={`text-xs ${
                                      isWeekCurrent
                                        ? "text-[#C8B89A]"
                                        : isWeekDone
                                        ? "text-[#7a7268]"
                                        : "text-[#b0a89e]"
                                    }`}
                                  >
                                    Wk {weekNum}: {week}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.12em] uppercase text-[#b0a89e] mb-2">
                            Deliverables
                          </p>
                          <div className="space-y-1.5">
                            {m.deliverables.map((d) => {
                              const delivered = profile.deliverables.some(
                                (del) =>
                                  del.monthNumber === m.month ||
                                  del.title.toLowerCase().includes(d.toLowerCase().slice(0, 10))
                              );
                              return (
                                <div key={d} className="flex items-center gap-2">
                                  <div
                                    className={`w-1 h-1 rounded-full ${
                                      delivered ? "bg-[#2D6A4F]" : "bg-[#EDEBE6]"
                                    }`}
                                  />
                                  <span
                                    className={`text-xs ${
                                      delivered ? "text-[#7a7268]" : "text-[#b0a89e]"
                                    }`}
                                  >
                                    {d}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Ongoing / Lite phase */}
          <div className="relative">
            <div
              className={`absolute -left-[2.35rem] top-1 w-3 h-3 rounded-full border ${
                profile.currentMonth > 3
                  ? "bg-[#C8B89A] border-[#C8B89A] ring-4 ring-[#C8B89A]/15"
                  : "bg-[#F5F3EF] border-[#EDEBE6] opacity-40"
              }`}
            />
            <div
              className={`border p-5 ${
                profile.currentMonth > 3
                  ? "border-[#C8B89A]/30"
                  : "border-[#EDEBE6] opacity-40"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] tracking-[0.15em] uppercase text-[#b0a89e]">
                  {isCore ? "Month 4+" : "Ongoing"}
                </span>
                {profile.currentMonth > 3 && (
                  <span className="text-[9px] tracking-[0.12em] uppercase text-[#C8B89A]">
                    Current
                  </span>
                )}
              </div>
              <h3 className="text-xl font-[300] text-[#1A1917]">Ongoing</h3>
              <p className="text-xs text-[#7a7268] mt-0.5">
                Monthly social plans, progress reports & continuing refinement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
