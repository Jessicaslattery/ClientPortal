"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function completeTask(taskId: string) {
  const session = await requireAuth("client");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.clientProfileId !== session.clientProfileId) {
    throw new Error("Not authorised");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { completed: true, completedAt: new Date() },
  });

  // Auto-progress linked goal when task is completed
  if (task.goalId) {
    const goal = await prisma.goal.findUnique({ where: { id: task.goalId } });
    if (goal && goal.progressPercent < 100) {
      // Count remaining incomplete tasks for this goal to estimate progress increment
      const totalTasks = await prisma.task.count({ where: { goalId: task.goalId } });
      const completedTasks = await prisma.task.count({ where: { goalId: task.goalId, completed: true } });
      const newProgress = totalTasks > 0
        ? Math.min(100, Math.round((completedTasks / totalTasks) * 100))
        : Math.min(100, goal.progressPercent + 10);

      if (newProgress > goal.progressPercent) {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { progressPercent: newProgress },
        });
        await prisma.goalProgressNote.create({
          data: {
            goalId: goal.id,
            progress: newProgress,
            note: `Task completed: "${task.title}"`,
          },
        });
      }
    }
  }

  revalidatePath("/tasks");
  revalidatePath("/home");
  revalidatePath("/goals");
}

export async function createClientTask(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "Not authorised." };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const dueDateRaw = (formData.get("dueDate") as string)?.trim();

  if (!title) return { error: "Task title is required." };

  await prisma.task.create({
    data: {
      title,
      description,
      clientProfileId: session.clientProfileId,
      assignedTo: "client",
      owner: "Client",
      source: "manual",
      priority: "medium",
      category: "General",
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/home");
  return { success: true };
}

export async function updateClientTask(
  taskId: string,
  data: { title?: string; description?: string | null; notes?: string | null; dueDate?: string | null }
): Promise<{ error?: string }> {
  const session = await requireAuth("client");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.clientProfileId !== session.clientProfileId) {
    return { error: "Not authorised." };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    },
  });

  revalidatePath("/tasks");
  return {};
}

export async function reopenTask(taskId: string) {
  const session = await requireAuth("client");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.clientProfileId !== session.clientProfileId) {
    throw new Error("Not authorised");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { completed: false, completedAt: null },
  });

  revalidatePath("/tasks");
  revalidatePath("/home");
}
