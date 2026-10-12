"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { generateOnboardingContext } from "@/lib/agent";

export async function submitOnboardingAction(
  _prev: { error?: string; success?: string },
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await requireAuth("client");
  const cid = session.clientProfileId;
  if (!cid) return { error: "Client profile not found." };

  const str = (key: string) => (formData.get(key) as string)?.trim() || "";

  const data = {
    whatTheyDo: str("businessDescription") || str("whatTheyDo"),
    whoTheyServe: str("targetAudience") || str("whoTheyServe"),
    currentRevenue: str("currentRevenue"),
    revenueGoal: str("revenueGoal"),
    biggestChallenge: str("biggestRevenueChallenge") || str("biggestChallenge"),
    whatIsWorking: str("bestPerformingContent") || str("whatIsWorking"),
    whatIsNot: str("contentChallenges") || str("whatIsNot"),
    contentPlatforms: str("currentMarketingChannels") || str("contentPlatforms"),
    biggestPersonalBlock: str("founderWeaknesses") || str("biggestPersonalBlock"),
    goalOne: str("programmeGoal1") || str("goalOne"),
    goalTwo: str("programmeGoal2") || str("goalTwo"),
    goalThree: str("programmeGoal3") || str("goalThree"),
    successIn6Months: str("successLooksLike") || str("successIn6Months"),
    submittedAt: new Date(),
  };

  await prisma.businessContextIntake.upsert({
    where: { clientProfileId: cid },
    update: data,
    create: { clientProfileId: cid, ...data },
  });

  try {
    await generateOnboardingContext(cid);
  } catch {
    // Don't fail the form submission if AI fails
  }

  await prisma.clientProfile.update({
    where: { id: cid },
    data: { onboardingComplete: true },
  });

  redirect("/home");
}
