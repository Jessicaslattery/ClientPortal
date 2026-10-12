import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContentCalendar } from "@/components/client/ContentCalendar";
import { ContentAnalyticsHistory } from "@/components/client/ContentAnalyticsHistory";

export default async function ContentCalendarPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const now = new Date();

  // Fetch 3 months: current + next 2 so client can add posts in advance
  const months: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const [posts, allTimePosts, analyticsWeeks] = await Promise.all([
    prisma.contentPost.findMany({
      where: { clientProfileId: session.clientProfileId, month: { in: months } },
      orderBy: { postDate: "asc" },
    }),
    prisma.contentPost.findMany({
      where: { clientProfileId: session.clientProfileId },
      select: { funnel: true, contentType: true, status: true, views: true, likes: true, comments: true, shares: true, saves: true, reach: true },
    }),
    prisma.contentAnalytics.findMany({
      where: { clientProfileId: session.clientProfileId },
      orderBy: { weekOf: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Content Calendar
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          Your personalised content plan
        </p>
      </div>

      <ContentCalendar
        allPosts={posts.map((p) => ({
          id: p.id,
          postDate: p.postDate.toISOString(),
          month: p.month,
          contentType: p.contentType,
          funnel: p.funnel,
          topic: p.topic,
          hook: p.hook,
          hookType: p.hookType,
          desiredOutcome: p.desiredOutcome,
          inspirationLink: p.inspirationLink,
          planDetails: p.planDetails,
          status: p.status,
          createdBy: p.createdBy,
          clientApproved: p.clientApproved,
          clientFeedback: p.clientFeedback,
          views: p.views,
          likes: p.likes,
          shares: p.shares,
          saves: p.saves,
          comments: p.comments,
          reach: p.reach,
          metricsLoggedAt: p.metricsLoggedAt?.toISOString() ?? null,
        }))}
        initialMonth={months[0]}
        availableMonths={months}
        clientProfileId={session.clientProfileId}
      />

      <ContentAnalyticsHistory
        allPosts={allTimePosts}
        analyticsWeeks={analyticsWeeks.map((w) => ({
          weekOf: w.weekOf.toISOString(),
          platform: w.platform,
          reach: w.reach,
          engagementRate: w.engagementRate,
          followerGrowth: w.followerGrowth,
        }))}
      />
    </div>
  );
}
