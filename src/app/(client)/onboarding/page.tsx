import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/client/OnboardingForm";

export default async function OnboardingPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const [profile, intake] = await Promise.all([
    prisma.clientProfile.findUnique({
      where: { id: session.clientProfileId },
      select: { founderName: true, businessName: true, onboardingComplete: true },
    }),
    prisma.businessContextIntake.findUnique({
      where: { clientProfileId: session.clientProfileId },
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Welcome, {profile?.founderName?.includes("&") ? profile.founderName.split(" ").slice(0, -1).join(" ") : profile?.founderName?.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-[#5C5550]">
          {intake?.submittedAt
            ? "You've already submitted your intake · update any answers below and resubmit."
            : "Let's start by understanding your business so we can make every session count."}
        </p>
      </div>

      <OnboardingForm existing={intake} />
    </div>
  );
}
