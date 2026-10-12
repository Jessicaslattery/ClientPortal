"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markSuggestionUsed(id: string) {
  await requireAuth("founder");

  await prisma.founderSuggestion.update({
    where: { id },
    data: { used: true, usedAt: new Date() },
  });

  revalidatePath("/dashboard");
}
