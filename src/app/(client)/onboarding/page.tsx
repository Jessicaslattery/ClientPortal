import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/client/OnboardingForm";
import { SocialMediaIntakeForm } from "@/components/client/SocialMediaIntakeForm";
import { ClientWelcomeSection } from "@/components/client/ClientWelcomeSection";

export default async function OnboardingPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const [profile, intake, socialIntake] = await Promise.all([
    prisma.clientProfile.findUnique({
      where: { id: session.clientProfileId },
      select: {
        founderName: true,
        businessName: true,
        onboardingComplete: true,
        welcomeVideoUrl: true,
        kickoffCallUrl: true,
        package: true,
      },
    }),
    prisma.businessContextIntake.findUnique({
      where: { clientProfileId: session.clientProfileId },
    }),
    prisma.socialMediaContextIntake.findUnique({
      where: { clientProfileId: session.clientProfileId },
    }),
  ]);

  const firstName = profile?.founderName?.includes("&")
    ? profile.founderName.split(" ").slice(0, -1).join(" ")
    : profile?.founderName?.split(" ")[0];

  const isConsulting = profile?.package !== "social";
  const termsPath = profile?.package === "social" ? "/terms/social" : "/terms/consulting";

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="text-2xl md:text-4xl font-[300] text-[#1A1917] uppercase leading-tight">
          <span className="block md:inline">Welcome,</span>{" "}
          <span className="block md:inline">{firstName}</span>
        </h1>
        <p className="mt-2 text-sm text-[#7a7268]">
          {intake?.submittedAt
            ? "You've already submitted your intake · update any answers below and resubmit."
            : "Let's start by understanding your business so we can make every session count."}
        </p>
      </div>

      <ClientWelcomeSection
        welcomeVideoUrl={profile?.welcomeVideoUrl ?? null}
        kickoffCallUrl={profile?.kickoffCallUrl ?? null}
        termsPath={termsPath}
      />

      {isConsulting && (
        <SocialMediaIntakeForm
          clientProfileId={session.clientProfileId}
          existing={socialIntake}
        />
      )}

      <OnboardingForm existing={intake} />
    </div>
  );
}
