import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FounderContentCalendar } from "@/components/founder/FounderContentCalendar";

export default async function ClientSocialPlanningPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAuth("founder");
  const { clientId } = await params;
  const { month: monthParam } = await searchParams;

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
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
      where: { clientProfileId: clientId, month },
      orderBy: { postDate: "asc" },
    }),
    prisma.contentPost.findMany({
      where: { clientProfileId: clientId },
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
          <Link href="/social-planning" className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors">
            Content Planner
          </Link>
          <span className="text-[#EDEBE6]">/</span>
          <span className="text-xs text-[#7a7268]">{client.founderName}</span>
        </div>
        <div className="flex items-end justify-between mt-1 border-b border-[#EDEBE6] pb-6">
          <div>
            <h1 className="text-4xl font-[300] text-[#1A1917]">{client.founderName}</h1>
            <p className="mt-1 text-sm text-[#b0a89e]">{client.businessName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/social-planning/${clientId}?month=${prevMonth}`}
              className="px-3 py-1.5 rounded-xl border border-[#EDEBE6] text-[#7a7268] text-xs hover:border-[#8C735A]/40 transition-colors"
            >←</Link>
            <span className="text-sm text-[#1A1917] min-w-[140px] text-center">{monthLabel}</span>
            <Link
              href={`/social-planning/${clientId}?month=${nextMonth}`}
              className="px-3 py-1.5 rounded-xl border border-[#EDEBE6] text-[#7a7268] text-xs hover:border-[#8C735A]/40 transition-colors"
            >→</Link>
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
              <Link
                key={mo}
                href={`/social-planning/${clientId}?month=${mo}`}
                className={`px-3 py-1 rounded-xl text-xs transition-colors ${
                  mo === month
                    ? "bg-[#1A1917] text-white"
                    : "border border-[#EDEBE6] text-[#7a7268] hover:border-[#8C735A]/40"
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
        clientProfileId={clientId}
        month={month}
      />
    </div>
  );
}
