"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function setClientAccessAction(clientId: string, isActive: boolean) {
  await requireAuth("founder");
  await prisma.clientProfile.update({
    where: { id: clientId },
    data: { isActive },
  });
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
}
