"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type State = { error?: string; success?: string };

export async function addResourceAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const title      = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category   = (formData.get("category") as string)?.trim();
  const type       = (formData.get("type") as string)?.trim();
  const fileUrl    = (formData.get("fileUrl") as string)?.trim();
  const visibility = (formData.get("visibility") as string)?.trim();
  const specificClientId = (formData.get("specificClientId") as string)?.trim() || null;

  if (!title || !category || !type || !visibility) {
    return { error: "Title, category, type and visibility are required." };
  }
  if (!fileUrl) {
    return { error: "A URL or link is required." };
  }

  await prisma.resource.create({
    data: {
      title,
      description: description || null,
      category,
      type,
      fileUrl,
      visibility,
      specificClientId: visibility === "specific" ? specificClientId : null,
    },
  });

  revalidatePath("/library");
  return { success: "Resource added." };
}

export async function deleteResourceAction(id: string): Promise<void> {
  await requireAuth("founder");
  await prisma.resource.delete({ where: { id } });
  revalidatePath("/library");
}
