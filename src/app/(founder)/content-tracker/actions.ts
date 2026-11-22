"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type StatusField = "planStatus" | "storiesStatus" | "reelsStatus";

export async function updateTrackerStatusAction(
  clientProfileId: string,
  month: string,
  field: StatusField,
  status: string
) {
  await requireAuth("founder");

  await prisma.socialPlanTracker.upsert({
    where: { clientProfileId_month: { clientProfileId, month } },
    update: { [field]: status },
    create: { clientProfileId, month, [field]: status },
  });

  revalidatePath("/content-tracker");
}

export async function updateTrackerNotesAction(
  clientProfileId: string,
  month: string,
  notes: string
) {
  await requireAuth("founder");

  await prisma.socialPlanTracker.upsert({
    where: { clientProfileId_month: { clientProfileId, month } },
    update: { notes },
    create: { clientProfileId, month, notes },
  });

  revalidatePath("/content-tracker");
}
