"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addGoalProgressNoteAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "Not authorised." };

  const goalId = formData.get("goalId") as string;
  const note = (formData.get("note") as string)?.trim();
  const progressRaw = (formData.get("progress") as string)?.trim();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, clientProfileId: session.clientProfileId },
  });
  if (!goal) return { error: "Goal not found." };
  if (!note) return { error: "Please add a note." };

  const progress = progressRaw !== "" && progressRaw !== undefined
    ? Math.min(100, Math.max(0, parseInt(progressRaw)))
    : goal.progressPercent;

  await prisma.goalProgressNote.create({ data: { goalId, note, progress } });
  await prisma.goal.update({ where: { id: goalId }, data: { progressPercent: progress } });

  revalidatePath("/goals");
  return { success: true };
}

export async function addGoalAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "Not authorised." };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const targetNote = (formData.get("targetNote") as string)?.trim() || null;

  if (!title) return { error: "Goal title is required." };

  await prisma.goal.create({
    data: {
      clientProfileId: session.clientProfileId,
      title,
      description,
      targetNote,
      progressPercent: 0,
      status: "active",
    },
  });

  revalidatePath("/goals");
  return { success: true };
}

export async function editGoalAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "Not authorised." };

  const goalId = formData.get("goalId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const targetNote = (formData.get("targetNote") as string)?.trim() || null;
  const progressRaw = (formData.get("progress") as string)?.trim();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, clientProfileId: session.clientProfileId },
  });
  if (!goal) return { error: "Goal not found." };
  if (!title) return { error: "Title is required." };

  const progressPercent = progressRaw !== ""
    ? Math.min(100, Math.max(0, parseInt(progressRaw) || 0))
    : goal.progressPercent;

  await prisma.goal.update({
    where: { id: goalId },
    data: { title, description, targetNote, progressPercent },
  });

  revalidatePath("/goals");
  return { success: true };
}

export async function deleteGoalAction(goalId: string): Promise<void> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return;

  await prisma.goal.deleteMany({
    where: { id: goalId, clientProfileId: session.clientProfileId },
  });

  revalidatePath("/goals");
}
