"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateBillingAction(
  _prev: { error?: string; success?: string },
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  await requireAuth("founder");

  const clientProfileId = formData.get("clientProfileId") as string;
  const monthlyInvestment = parseFloat(formData.get("monthlyInvestment") as string) || null;
  const nextBillingDateStr = formData.get("nextBillingDate") as string;
  const billingNotes = (formData.get("billingNotes") as string)?.trim() || null;

  const nextBillingDate = nextBillingDateStr ? new Date(nextBillingDateStr) : null;

  await prisma.clientProfile.update({
    where: { id: clientProfileId },
    data: { monthlyInvestment, nextBillingDate, billingNotes },
  });

  revalidatePath("/billing");
  return { success: "Billing updated." };
}
