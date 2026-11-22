"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logWinAction(_prev: unknown, formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "No profile found." };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const category = (formData.get("category") as string) || "general";

  if (!title) return { error: "Title is required." };

  await prisma.clientWin.create({
    data: {
      clientProfileId: session.clientProfileId,
      title,
      description,
      category,
    },
  });

  revalidatePath("/wins");
  revalidatePath("/home");
  return { success: "Win logged! 🎉" };
}
