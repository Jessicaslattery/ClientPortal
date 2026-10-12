"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runOnboardingAgent } from "@/lib/agents/onboarding-agent";
import { revalidatePath } from "next/cache";

export async function triggerOnboardingStep(clientId: string, step: 2 | 3 | 4) {
  await requireAuth("founder");

  const { agentDraftId } = await runOnboardingAgent(clientId, step);

  await prisma.onboardingStep.updateMany({
    where: { clientProfileId: clientId, step },
    data: { agentDraftId },
  });

  revalidatePath(`/clients/${clientId}`);
}
