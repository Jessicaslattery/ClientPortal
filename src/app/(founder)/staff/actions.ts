"use server";

import { requireAuth, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createStaffAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAuth("founder");

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (!name || !email) return { error: "Name and email are required." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with this email already exists." };

  const hashed = await hashPassword(password || crypto.randomBytes(16).toString("hex"));

  await prisma.user.create({
    data: { email, name, password: hashed, role: "staff" },
  });

  revalidatePath("/staff");
  return { success: true };
}

export async function deleteStaffAction(staffUserId: string) {
  await requireAuth("founder");
  await prisma.user.delete({ where: { id: staffUserId } });
  revalidatePath("/staff");
}

export async function assignClientToStaffAction(staffUserId: string, clientProfileId: string) {
  await requireAuth("founder");
  await prisma.staffAssignment.upsert({
    where: { staffUserId_clientProfileId: { staffUserId, clientProfileId } },
    create: { staffUserId, clientProfileId },
    update: {},
  });
  revalidatePath("/staff");
}

export async function removeClientAssignmentAction(staffUserId: string, clientProfileId: string) {
  await requireAuth("founder");
  await prisma.staffAssignment.deleteMany({
    where: { staffUserId, clientProfileId },
  });
  revalidatePath("/staff");
}
