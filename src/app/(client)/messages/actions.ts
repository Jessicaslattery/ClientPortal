"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendMessage(content: string, clientProfileId: string) {
  const session = await requireAuth("client");

  if (session.clientProfileId !== clientProfileId) {
    throw new Error("Not authorised");
  }

  if (!content.trim()) return;

  await prisma.message.create({
    data: {
      clientProfileId,
      senderId: session.id,
      senderRole: "client",
      content: content.trim(),
    },
  });

  revalidatePath("/messages");
}
