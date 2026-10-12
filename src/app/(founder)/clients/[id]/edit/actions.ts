"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateClientAction(clientProfileId: string, formData: FormData) {
  await requireAuth("founder");

  const founderName = (formData.get("founderName") as string)?.trim();
  const businessName = (formData.get("businessName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const website = (formData.get("website") as string)?.trim();
  const instagram = (formData.get("instagram") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const leadSource = (formData.get("leadSource") as string)?.trim() || null;
  const endDateStr = (formData.get("endDate") as string)?.trim();
  const isActiveStr = formData.get("isActive") as string;
  const birthdayStr = formData.get("birthday") as string;
  const packageName = (formData.get("packageName") as string)?.trim();
  const monthlyInvestment = formData.get("monthlyInvestment") as string;
  const nextBillingDateStr = formData.get("nextBillingDate") as string;
  const billingNotes = (formData.get("billingNotes") as string)?.trim();
  const businessContext = (formData.get("businessContext") as string)?.trim();
  const personalityNotes = (formData.get("personalityNotes") as string)?.trim();
  const communicationStyle = (formData.get("communicationStyle") as string)?.trim();
  const nextSessionFocus = (formData.get("nextSessionFocus") as string)?.trim();

  if (!founderName || !businessName || !email) return;

  await prisma.clientProfile.update({
    where: { id: clientProfileId },
    data: {
      founderName,
      businessName,
      email,
      phone: phone || null,
      website: website || null,
      instagram,
      address,
      leadSource,
      endDate: endDateStr ? new Date(endDateStr) : null,
      isActive: isActiveStr === "false" ? false : true,
      birthday: birthdayStr ? new Date(birthdayStr) : null,
      tier: packageName || "GROWTH",
      monthlyInvestment: monthlyInvestment ? parseFloat(monthlyInvestment) : null,
      nextBillingDate: nextBillingDateStr ? new Date(nextBillingDateStr) : null,
      billingNotes: billingNotes || null,
      businessContext: businessContext || null,
      personalityNotes: personalityNotes || null,
      communicationStyle: communicationStyle || null,
      nextSessionFocus: nextSessionFocus || null,
    },
  });

  revalidatePath(`/clients/${clientProfileId}`);
  redirect(`/clients/${clientProfileId}`);
}
