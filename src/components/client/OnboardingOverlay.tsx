"use client";

import { OnboardingForm } from "@/components/client/OnboardingForm";

type Intake = {
  businessDescription?: string | null;
  productsServices?: string | null;
  targetAudience?: string | null;
  pricePoints?: string | null;
  revenueModel?: string | null;
  currentRevenue?: string | null;
  revenueGoal?: string | null;
  biggestRevenueChallenge?: string | null;
  currentMarketingChannels?: string | null;
  contentFrequency?: string | null;
  bestPerformingContent?: string | null;
  contentChallenges?: string | null;
  brandVoice?: string | null;
  uniqueValueProp?: string | null;
  competitors?: string | null;
  founderStrengths?: string | null;
  founderWeaknesses?: string | null;
  workStyle?: string | null;
  biggestFear?: string | null;
  biggestMotivation?: string | null;
  supportNeeded?: string | null;
  programmeGoal1?: string | null;
  programmeGoal2?: string | null;
  programmeGoal3?: string | null;
  successLooksLike?: string | null;
};

export function OnboardingOverlay({
  firstName,
  existing,
}: {
  firstName: string;
  existing: Intake | null;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F3EF] overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 bg-[#F5F3EF]/95 backdrop-blur-sm border-b border-[#EDEBE6] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-xl font-[300] tracking-[0.15em] text-[#1A1917] uppercase">
              Welcome to Pivot Co.
            </h1>
            <p className="text-xs text-[#b0a89e] mt-0.5">
              Before your first session, tell Jess about your business.
            </p>
          </div>
          <div className="text-[10px] tracking-[0.1em] uppercase text-[#b0a89e]">
            Takes 15–20 minutes · save and resume any time
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <div className="mb-8">
            <p className="text-sm text-[#7a7268] leading-relaxed">
              Hi {firstName}, this questionnaire helps Jess prepare for your first session so you can get straight into the work.
              Your answers are private. Only Jess can see them.
            </p>
          </div>

          <OnboardingForm existing={existing} />
        </div>
      </div>
    </div>
  );
}
