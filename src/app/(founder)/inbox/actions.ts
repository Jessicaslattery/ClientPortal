"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendFounderMessageAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAuth("founder");

  const clientProfileId = formData.get("clientProfileId") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!clientProfileId || !content) return { error: "Message cannot be empty." };

  await prisma.message.create({
    data: {
      clientProfileId,
      senderId: session.id,
      senderRole: "founder",
      content,
    },
  });

  revalidatePath("/inbox");
  return { success: true };
}
