import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SocialPlanView } from "@/components/client/SocialPlanView";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function SocialPlanPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const plans = await prisma.socialPlan.findMany({
    where: { clientProfileId: session.clientProfileId, status: "published" },
    orderBy: [{ year: "desc" }, { monthNumber: "desc" }],
  });

  const currentPlan = plans.find(
    (p) => p.monthNumber === currentMonth && p.year === currentYear
  );
  const pastPlans = plans.filter(
    (p) => !(p.monthNumber === currentMonth && p.year === currentYear)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Content Strategy
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">Your monthly content strategy — for day-to-day planning, see Content Calendar</p>
      </div>

      <SocialPlanView
        currentPlan={currentPlan ? {
          id: currentPlan.id,
          monthNumber: currentPlan.monthNumber,
          year: currentPlan.year,
          brandVoiceNotes: currentPlan.brandVoiceNotes,
          contentPillars: currentPlan.contentPillars,
          storyOutlines: currentPlan.storyOutlines,
          dailyPostingGuide: currentPlan.dailyPostingGuide,
          socialAudit: currentPlan.socialAudit,
        } : null}
        pastPlans={pastPlans.map((p) => ({
          id: p.id,
          monthNumber: p.monthNumber,
          year: p.year,
          contentPillars: p.contentPillars,
          storyOutlines: p.storyOutlines,
          dailyPostingGuide: p.dailyPostingGuide,
        }))}
        currentMonthName={MONTHS[currentMonth - 1]}
        currentYear={currentYear}
        months={MONTHS}
      />
    </div>
  );
}
