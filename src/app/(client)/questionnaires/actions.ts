"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitQuestionnaireAction(type: string, formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const answers: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key !== "type") answers[key] = value.toString();
  });

  await prisma.questionnaireResponse.create({
    data: {
      clientProfileId: session.clientProfileId,
      type,
      answersJson: JSON.stringify(answers),
    },
  });

  revalidatePath("/questionnaires");
  redirect("/questionnaires");
}
