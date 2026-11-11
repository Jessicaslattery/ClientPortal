import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StoriesCalendar } from "@/components/sms/StoriesCalendar";

export default async function SmsStoriesPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const smsProfile = await prisma.smsClientProfile.findUnique({
    where: { clientProfileId: session.clientProfileId },
  });
  if (!smsProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-[#6d675e]">No social strategy found.</p>
      </div>
    );
  }

  const plan = await prisma.monthPlan.findUnique({
    where: { smsClientId_month: { smsClientId: smsProfile.id, month: "2026-11" } },
    include: { storyOutlines: { orderBy: { date: "asc" } } },
  });

  const stories = (plan?.storyOutlines ?? []).map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    theme: s.theme,
    engagementTool: s.engagementTool,
    cta: s.cta,
    isLaunchDay: s.isLaunchDay,
    isPromoDay: s.isPromoDay,
    doneByClient: s.doneByClient,
  }));

  const doneCount = stories.filter((s) => s.doneByClient).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">November 2026</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
          Story Outlines
        </h1>
        <p className="mt-1 text-sm text-[#6d675e]">{doneCount} of {stories.length} days done</p>
      </div>
      <StoriesCalendar stories={stories} />
    </div>
  );
}
