"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function requestSocialPlanAction(
  _prev: { error?: string; success?: string },
  _formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await requireAuth("client");
  const cid = session.clientProfileId;
  if (!cid) return { error: "Client profile not found." };

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentRequest = await prisma.message.findFirst({
    where: {
      clientProfileId: cid,
      senderRole: "client",
      content: { contains: "social plan" },
      createdAt: { gte: oneWeekAgo },
    },
  });

  if (recentRequest) {
    return { error: "You've already requested a social plan this week. Jess will have it ready soon." };
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { id: cid },
    select: { founderName: true, user: { select: { id: true } } },
  });

  if (!profile) return { error: "Profile not found." };

  await prisma.message.create({
    data: {
      clientProfileId: cid,
      senderId: profile.user.id,
      senderRole: "client",
      content: `Hi Jess, I'd love a new social plan for next month when you get a chance!`,
      read: false,
    },
  });

  revalidatePath("/social-plan");
  return { success: "Request sent to Jess. She'll get your plan ready soon." };
}

