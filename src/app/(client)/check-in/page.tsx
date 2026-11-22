import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CheckInForm } from "@/components/client/CheckInForm";

export default async function CheckInPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { id: session.clientProfileId },
    select: { currentMonth: true, currentWeek: true },
  });

  if (!profile) redirect("/login");

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const thisWeek = await prisma.checkIn.findFirst({
    where: { clientProfileId: session.clientProfileId, createdAt: { gte: weekStart } },
  });

  const previous = await prisma.checkIn.findMany({
    where: {
      clientProfileId: session.clientProfileId,
      ...(thisWeek ? { id: { not: thisWeek.id } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  type CheckInRow = NonNullable<typeof thisWeek>;

  const buildSections = (ci: CheckInRow) =>
    [
      { label: "What you completed", value: ci.completed },
      { label: "What didn't get done", value: ci.notCompleted },
      { label: "What has shifted", value: ci.shifted },
      { label: "What feels stuck", value: ci.stuck },
      { label: "Energy score", value: `${ci.energyScore}/10` },
      ci.energyNote ? { label: "What that number means", value: ci.energyNote } : null,
      ci.bottleneck ? { label: "Where you felt the bottleneck", value: ci.bottleneck } : null,
      ci.clientExperience ? { label: "Client experience", value: ci.clientExperience } : null,
      ci.callNotes ? { label: "For your next call", value: ci.callNotes } : null,
      ci.preCallNote ? { label: "Before we speak", value: ci.preCallNote } : null,
    ].filter((x): x is { label: string; value: string } => x !== null && Boolean(x.value));

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-[200] text-[#1A1917]">
          Weekly Check-in
        </h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">
          Growth Partnership
        </p>
      </div>

      {/* This week */}
      {thisWeek ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2D6A4F]/25 bg-[#2D6A4F]/5 px-5 py-4 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] shrink-0" />
            <p className="text-sm text-[#2D6A4F]">
              Check-in submitted this week
            </p>
          </div>
          <div className="rounded-2xl border border-[#EDEBE6] divide-y divide-[#EDEBE6]">
            {buildSections(thisWeek).map((item) => (
              <div key={item.label} className="px-5 py-4">
                <p className="text-[10px] tracking-[0.12em] uppercase text-[#b0a89e] mb-1.5">
                  {item.label}
                </p>
                <p className="text-sm text-[#1A1917] leading-6">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <CheckInForm
          clientProfileId={session.clientProfileId}
          currentMonth={profile.currentMonth}
          currentWeek={profile.currentWeek}
        />
      )}

      {/* Previous submissions log */}
      {previous.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#b0a89e] mb-4">
            Previous check-ins
          </h2>
          <div className="rounded-2xl border border-[#EDEBE6] divide-y divide-[#EDEBE6]">
            {previous.map((ci) => (
              <details key={ci.id} className="group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-[#F5F2ED] transition-colors">
                  <div>
                    <span className="text-sm text-[#1A1917]">
                      {new Date(ci.createdAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#C8B89A] tabular-nums">
                      {ci.energyScore}/10
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      className="text-[#b0a89e] group-open:rotate-180 transition-transform"
                    >
                      <path d="M2 3.5l3 3 3-3" />
                    </svg>
                  </div>
                </summary>
                <div className="divide-y divide-[#EDEBE6] border-t border-[#EDEBE6]">
                  {buildSections(ci).map((item) => (
                    <div key={item.label} className="px-5 py-3.5">
                      <p className="text-[10px] tracking-[0.12em] uppercase text-[#b0a89e] mb-1.5">
                        {item.label}
                      </p>
                      <p className="text-xs text-[#7a7268] leading-5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
