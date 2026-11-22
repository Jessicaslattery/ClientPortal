"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleFeatureAction(
  clientProfileId: string,
  featureKey: string,
  enabled: boolean
) {
  await requireAuth("founder");

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientProfileId },
    select: { hiddenTabs: true },
  });
  if (!client) throw new Error("Client not found");

  let hiddenTabs = [...client.hiddenTabs];

  if (enabled) {
    // Remove from hidden (make visible)
    hiddenTabs = hiddenTabs.filter((t) => t !== featureKey);
  } else {
    // Add to hidden (make invisible)
    if (!hiddenTabs.includes(featureKey)) {
      hiddenTabs.push(featureKey);
    }
  }

  await prisma.clientProfile.update({
    where: { id: clientProfileId },
    data: { hiddenTabs },
  });

  revalidatePath(`/clients/${clientProfileId}`);
}
