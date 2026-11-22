"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createAnnouncementAction(_prev: unknown, formData: FormData) {
  await requireAuth("founder");

  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const audience = (formData.get("audience") as string) || "all";

  if (!title || !body) return { error: "Title and body are required." };

  await prisma.announcement.create({
    data: { title, body, audience },
  });

  revalidatePath("/announcements");
  return { success: true };
}

export async function deleteAnnouncementAction(id: string) {
  await requireAuth("founder");
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/announcements");
}
