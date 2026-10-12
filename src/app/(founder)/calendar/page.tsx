import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function ContentCalendarPage() {
  await requireAuth("founder");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const plans = await prisma.socialPlan.findMany({
    where: { year: currentYear },
    include: { clientProfile: true },
    orderBy: [{ monthNumber: "asc" }, { clientProfile: { founderName: "asc" } }],
  });

  const allClients = await prisma.clientProfile.findMany({
    select: { id: true, founderName: true, businessName: true },
    orderBy: { founderName: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Content Calendar</h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">{currentYear} social plans overview</p>
      </div>

      {/* Month grid — the season starts in September, so earlier months in the
          current year are never shown here. */}
      <div className="space-y-6">
        {MONTHS.map((monthName, idx) => {
          const monthNum = idx + 1;
          if (currentYear === 2026 && monthNum < 9) return null;
          const monthPlans = plans.filter((p) => p.monthNumber === monthNum);
          const isCurrentMonth = monthNum === currentMonth;

          return (
            <div
              key={monthName}
              className={`border ${isCurrentMonth ? "border-[#C8B89A]/30" : "border-[#E8E2D9]"}`}
            >
              <div
                className={`flex items-center justify-between px-5 py-3 border-b ${
                  isCurrentMonth ? "border-[#C8B89A]/20 bg-[#C8B89A]/4" : "border-[#E8E2D9]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <h3 className={`text-sm ${isCurrentMonth ? "text-[#C8B89A]" : "text-[#1A1714]"}`}>
                    {monthName} {currentYear}
                  </h3>
                  {isCurrentMonth && (
                    <span className="text-[9px] tracking-[0.15em] uppercase text-[#C8B89A]">
                      Current
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#8C8277]">
                  {monthPlans.length}/{allClients.length} plans
                </span>
              </div>

              <div className="divide-y divide-[#E8E2D9]">
                {allClients.map((client) => {
                  const plan = monthPlans.find((p) => p.clientProfile.id === client.id);
                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <Link
                        href={`/clients/${client.id}/content-calendar`}
                        className="text-xs text-[#5C5550] hover:text-[#C8B89A] transition-colors"
                      >
                        {client.founderName}
                      </Link>
                      {plan ? (
                        <StatusBadge
                          label={plan.status}
                          status={
                            plan.status === "published"
                              ? "active"
                              : plan.status === "approved"
                              ? "pending"
                              : "gold"
                          }
                        />
                      ) : (
                        <span className="text-[10px] tracking-[0.1em] text-[#E8E2D9] uppercase">
                          Not generated
                        </span>
                      )}
                    </div>
                  );
                })}
                {allClients.length === 0 && (
                  <div className="px-5 py-4 text-xs text-[#8C8277]">No clients yet.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
