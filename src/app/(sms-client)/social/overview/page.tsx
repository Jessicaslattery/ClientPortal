import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OverviewKpis } from "@/components/sms/OverviewKpis";
import { PillarBreakdown } from "@/components/sms/PillarBreakdown";
import { TopPosts } from "@/components/sms/TopPosts";

export default async function SmsOverviewPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const smsProfile = await prisma.smsClientProfile.findUnique({
    where: { clientProfileId: session.clientProfileId },
    include: {
      monthPlans: {
        where: { month: "2026-11" },
        include: {
          postOutlines: { orderBy: { publishDate: "asc" } },
          monthlyReport: true,
        },
      },
      accountInsights: {
        where: { metric: { in: ["followers", "reach", "followers_gained"] } },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!smsProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-[#6d675e]">No social strategy found for your account.</p>
      </div>
    );
  }

  const plan = smsProfile.monthPlans[0];
  if (!plan) redirect("/social/posts");

  const posts = plan.postOutlines;
  const postedPosts = posts.filter((p) => p.status === "posted");

  // KPI calcs
  const totalReach = postedPosts.reduce((s, p) => s + (p.reach ?? 0), 0);
  const totalEngagements = postedPosts.reduce(
    (s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.saves ?? 0),
    0
  );
  const avgEngRate =
    totalReach > 0 ? ((totalEngagements / totalReach) * 100).toFixed(1) : "—";

  const latestFollowers = smsProfile.accountInsights
    .filter((i) => i.metric === "followers")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const planCompletion = posts.length > 0 ? Math.round((postedPosts.length / posts.length) * 100) : 0;

  // Pillar breakdown (posted only)
  const pillars = ["training", "nutrition", "results", "personal_brand"] as const;
  const pillarData = pillars.map((p) => {
    const pPosts = postedPosts.filter((post) => post.pillar === p);
    const pReach = pPosts.reduce((s, post) => s + (post.reach ?? 0), 0);
    const pEngagements = pPosts.reduce(
      (s, post) => s + (post.likes ?? 0) + (post.comments ?? 0) + (post.saves ?? 0),
      0
    );
    return {
      pillar: p,
      count: pPosts.length,
      reach: pReach,
      engRate: pReach > 0 ? parseFloat(((pEngagements / pReach) * 100).toFixed(1)) : 0,
    };
  });

  // Top 3 posts by reach
  const topPosts = [...postedPosts]
    .sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      title: p.title,
      format: p.format,
      pillar: p.pillar,
      reach: p.reach ?? 0,
      likes: p.likes ?? 0,
      saves: p.saves ?? 0,
      comments: p.comments ?? 0,
    }));

  const report = plan.monthlyReport;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e] font-[var(--font-inter-sms)]">
          November 2026
        </p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
          Monthly Overview
        </h1>
      </div>

      {/* KPIs */}
      <OverviewKpis
        totalReach={totalReach}
        avgEngRate={avgEngRate as string}
        followers={latestFollowers?.value ?? 0}
        planCompletion={planCompletion}
        postedCount={postedPosts.length}
        totalCount={posts.length}
      />

      {/* Strategist notes */}
      {report && (
        <section className="border border-[#D9D3C6] p-6 space-y-4">
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Strategist Notes</p>
          <p className="text-sm text-[#1A1917] leading-relaxed">{report.headlineNote}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {report.worked && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#2D6A4F] mb-1">What worked</p>
                <p className="text-xs text-[#1A1917] leading-relaxed">{report.worked}</p>
              </div>
            )}
            {report.didntWork && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#9B2335] mb-1">What didn&apos;t work</p>
                <p className="text-xs text-[#1A1917] leading-relaxed">{report.didntWork}</p>
              </div>
            )}
            {report.nextMonth && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#1A1917] mb-1">Next month</p>
                <p className="text-xs text-[#1A1917] leading-relaxed">{report.nextMonth}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pillar performance */}
      <PillarBreakdown pillarData={pillarData} />

      {/* Top posts */}
      <TopPosts posts={topPosts} />
    </div>
  );
}
