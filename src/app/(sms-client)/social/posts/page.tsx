import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { PostsGrid } from "@/components/sms/PostsGrid";

export default async function SmsPostsPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const smsProfile = await prisma.smsClientProfile.findUnique({
    where: { clientProfileId: session.clientProfileId },
  });
  if (!smsProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-[#6d675e]">No social strategy found for your account.</p>
      </div>
    );
  }

  const plan = await prisma.monthPlan.findUnique({
    where: { smsClientId_month: { smsClientId: smsProfile.id, month: "2026-11" } },
    include: { postOutlines: { orderBy: { position: "asc" } } },
  });

  const posts = (plan?.postOutlines ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    publishDate: p.publishDate?.toISOString() ?? null,
    format: p.format,
    pillar: p.pillar,
    hook: p.hook,
    cta: p.cta,
    goal: p.goal,
    inspoLink: p.inspoLink,
    status: p.status,
    liveUrl: p.liveUrl,
    views: p.views,
    likes: p.likes,
    comments: p.comments,
    saves: p.saves,
    reach: p.reach,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">November 2026</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
          Post Outlines
        </h1>
        <p className="mt-1 text-sm text-[#6d675e]">{posts.length} posts planned for the month</p>
      </div>
      <PostsGrid posts={posts} />
    </div>
  );
}
