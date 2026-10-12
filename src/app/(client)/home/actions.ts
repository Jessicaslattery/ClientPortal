"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function requestCallAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAuth("client");
  const cid = session.clientProfileId;
  if (!cid) return { error: "Not authorised." };

  const preferredDate = (formData.get("preferredDate") as string)?.trim();
  const preferredTime = (formData.get("preferredTime") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim();

  if (!preferredDate) return { error: "Please select a preferred date." };

  const profile = await prisma.clientProfile.findUnique({
    where: { id: cid },
    select: { user: { select: { id: true } } },
  });
  if (!profile) return { error: "Profile not found." };

  const dateFormatted = new Date(preferredDate).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeLabel = preferredTime ? ` at ${preferredTime}` : "";
  const notesLine = notes ? `\n\nNotes: ${notes}` : "";

  await prisma.message.create({
    data: {
      clientProfileId: cid,
      senderId: profile.user.id,
      senderRole: "client",
      content: `Hi Jess, I'd like to book a call on ${dateFormatted}${timeLabel}. Could you please confirm?${notesLine}`,
      read: false,
    },
  });

  revalidatePath("/home");
  return { success: true };
}
