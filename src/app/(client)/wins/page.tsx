import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { WinLogForm } from "@/components/client/WinLogForm";

const CATEGORY_LABELS: Record<string, string> = {
  revenue: "Revenue",
  milestone: "Milestone",
  personal: "Personal",
  other: "Other",
  general: "Win",
};

export default async function WinsPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const wins = await prisma.clientWin.findMany({
    where: { clientProfileId: session.clientProfileId },
    orderBy: { celebratedAt: "desc" },
  });

  const byMonth: Record<string, typeof wins> = {};
  for (const win of wins) {
    const key = new Date(win.celebratedAt).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(win);
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div className="border-b border-[#EDEBE6] pb-6">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-1">Your journey</p>
        <h1 className="text-5xl font-[200] text-[#1A1917] leading-tight">Win Log</h1>
        <p className="mt-1.5 text-sm text-[#7B746B]">Every win counts. Log it here.</p>
      </div>

      <WinLogForm />

      {wins.length === 0 ? (
        <div className="border border-[#EDEBE6] rounded-2xl px-6 py-12 text-center">
          <p className="text-sm text-[#7B746B]">No wins logged yet: add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byMonth).map(([month, monthWins]) => (
            <div key={month}>
              <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-3">{month}</p>
              <div className="border border-[#EDEBE6] rounded-2xl divide-y divide-[#EDEBE6]">
                {monthWins.map((win) => (
                  <div key={win.id} className="px-5 py-4 flex items-start gap-4">
                    <div className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[10px]">
                      ✦
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm text-[#1A1917]">{win.title}</p>
                        <span className="text-[9px] tracking-[0.1em] uppercase text-[#b0a89e] border border-[#EDEBE6] rounded px-1.5 py-0.5">
                          {CATEGORY_LABELS[win.category] ?? win.category}
                        </span>
                      </div>
                      {win.description && (
                        <p className="text-xs text-[#7B746B] leading-5">{win.description}</p>
                      )}
                      <p className="text-[10px] text-[#b0a89e] mt-1">
                        {new Date(win.celebratedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
