import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FounderContentCalendar } from "@/components/founder/FounderContentCalendar";

export default async function ClientContentCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAuth("founder");
  const { id } = await params;
  const { month: monthParam } = await searchParams;

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    select: { id: true, founderName: true, businessName: true },
  });
  if (!client) notFound();

  const now = new Date();
  const month = monthParam ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, m] = month.split("-").map(Number);
  const monthLabel = new Date(year, m - 1, 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  const prevDate = new Date(year, m - 2, 1);
  const nextDate = new Date(year, m, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

  const [posts, allMonths] = await Promise.all([
    prisma.contentPost.findMany({
      where: { clientProfileId: id, month },
      orderBy: { postDate: "asc" },
    }),
    prisma.contentPost.findMany({
      where: { clientProfileId: id },
      select: { month: true },
      distinct: ["month"],
      orderBy: { month: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/clients" className="text-xs text-[#8C8277] hover:text-[#5C5550] transition-colors">Clients</Link>
          <span className="text-[#E8E2D9]">/</span>
          <Link href={`/clients/${id}`} className="text-xs text-[#8C8277] hover:text-[#5C5550] transition-colors">{client.founderName}</Link>
          <span className="text-[#E8E2D9]">/</span>
          <span className="text-xs text-[#5C5550]">Content Calendar</span>
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Content Calendar</h1>
            <p className="mt-1 text-sm text-[#5C5550]">{client.founderName} · {client.businessName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/clients/${id}/content-calendar?month=${prevMonth}`}
              className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-[#5C5550] text-xs hover:border-[#C8B89A] transition-colors">←</Link>
            <span className="text-sm text-[#1A1714] min-w-[140px] text-center">{monthLabel}</span>
            <Link href={`/clients/${id}/content-calendar?month=${nextMonth}`}
              className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-[#5C5550] text-xs hover:border-[#C8B89A] transition-colors">→</Link>
          </div>
        </div>
      </div>

      {/* Month tabs */}
      {allMonths.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allMonths.map(({ month: mo }) => {
            const [y, mn] = mo.split("-").map(Number);
            const label = new Date(y, mn - 1, 1).toLocaleDateString("en-AU", { month: "short", year: "numeric" });
            return (
              <Link key={mo} href={`/clients/${id}/content-calendar?month=${mo}`}
                className={`px-3 py-1 rounded-xl text-xs transition-colors ${
                  mo === month ? "bg-[#1A1714] text-[#FAFAF8]" : "border border-[#E8E2D9] text-[#5C5550] hover:border-[#C8B89A]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      <FounderContentCalendar
        posts={posts.map((p) => ({
          id: p.id,
          postDate: p.postDate.toISOString(),
          contentType: p.contentType,
          funnel: p.funnel,
          topic: p.topic,
          hook: p.hook,
          hookType: p.hookType,
          desiredOutcome: p.desiredOutcome,
          status: p.status,
          createdBy: p.createdBy,
          clientApproved: p.clientApproved,
          clientFeedback: p.clientFeedback,
          inspirationLink: p.inspirationLink,
          planDetails: p.planDetails,
          likes: p.likes,
          comments: p.comments,
          reposts: p.reposts,
          shares: p.shares,
          saves: p.saves,
          views: p.views,
          reach: p.reach,
          profileVisits: p.profileVisits,
          follows: p.follows,
          metricsLoggedAt: p.metricsLoggedAt?.toISOString() ?? null,
        }))}
        clientProfileId={id}
        month={month}
      />
    </div>
  );
}
