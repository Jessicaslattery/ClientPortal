"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── One-time tasks ───────────────────────────────────────────────────────────

export async function completeTaskAction(taskId: string) {
  await requireAuth("founder");
  await prisma.task.update({
    where: { id: taskId },
    data: { completed: true, completedAt: new Date() },
  });
  revalidatePath("/my-tasks");
}

export async function reopenTaskAction(taskId: string) {
  await requireAuth("founder");
  await prisma.task.update({
    where: { id: taskId },
    data: { completed: false, completedAt: null },
  });
  revalidatePath("/my-tasks");
}

export async function createFounderTaskAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAuth("founder");

  const title = (formData.get("title") as string)?.trim();
  const clientProfileId = (formData.get("clientProfileId") as string)?.trim() || null;
  const category = (formData.get("category") as string)?.trim() || "General";
  const priority = (formData.get("priority") as string) || "medium";
  const dueDateRaw = (formData.get("dueDate") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title) return { error: "Task title is required." };

  await prisma.task.create({
    data: {
      title,
      category,
      priority,
      assignedTo: "founder",
      owner: "Jess",
      source: "manual",
      notes,
      clientProfileId: clientProfileId || null,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath("/my-tasks");
  return { success: true };
}

export async function updateTaskNotesAction(taskId: string, notes: string) {
  await requireAuth("founder");
  await prisma.task.update({
    where: { id: taskId },
    data: { notes: notes.trim() || null },
  });
  revalidatePath("/my-tasks");
}

// ─── Recurring tasks ──────────────────────────────────────────────────────────

export async function createRecurringTaskAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAuth("founder");

  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "General";
  const priority = (formData.get("priority") as string) || "medium";
  const notes = (formData.get("notes") as string)?.trim() || null;

  const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const days = ALL_DAYS.filter((d) => formData.get(`day_${d}`) === "on").join(",");

  if (!title) return { error: "Task title is required." };
  if (!days) return { error: "Select at least one day." };

  await prisma.recurringTask.create({
    data: { title, category, priority, notes, days },
  });

  revalidatePath("/my-tasks");
  return { success: true };
}

export async function deleteRecurringTaskAction(id: string) {
  await requireAuth("founder");
  await prisma.recurringTask.delete({ where: { id } });
  revalidatePath("/my-tasks");
}

export async function toggleRecurringCompletionAction(
  recurringTaskId: string,
  weekStart: string,
  currentlyDone: boolean
) {
  await requireAuth("founder");
  const ws = new Date(weekStart);

  if (currentlyDone) {
    await prisma.recurringTaskCompletion.deleteMany({
      where: { recurringTaskId, weekStart: ws },
    });
  } else {
    await prisma.recurringTaskCompletion.upsert({
      where: { recurringTaskId_weekStart: { recurringTaskId, weekStart: ws } },
      create: { recurringTaskId, weekStart: ws },
      update: {},
    });
  }

  revalidatePath("/my-tasks");
}
