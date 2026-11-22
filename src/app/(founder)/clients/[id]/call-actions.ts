"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function scheduleCallAction(clientId: string, formData: FormData) {
  await requireAuth("founder");

  const title = (formData.get("title") as string)?.trim();
  const scheduledAt = formData.get("scheduledAt") as string;

  if (!title || !scheduledAt) return { error: "Title and date are required." };

  await prisma.call.create({
    data: {
      clientProfileId: clientId,
      title,
      scheduledAt: new Date(scheduledAt),
    },
  });

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function saveCallNotesAction(
  clientId: string,
  callId: string,
  formData: FormData
) {
  await requireAuth("founder");

  const transcript = (formData.get("transcript") as string)?.trim() || null;
  const summaryContent = (formData.get("summaryContent") as string)?.trim() || null;
  const keyDecisions = (formData.get("keyDecisions") as string)?.trim() || null;
  const nextSteps = (formData.get("nextSteps") as string)?.trim() || null;
  const completedAt = formData.get("completedAt") as string;
  const notesUrl = (formData.get("notesUrl") as string)?.trim() || null;
  const tasksRaw = (formData.get("tasks") as string)?.trim() || "";

  await prisma.call.update({
    where: { id: callId },
    data: {
      transcript,
      summaryContent,
      keyDecisions,
      nextSteps,
      notesUrl,
      summaryStatus: summaryContent ? "complete" : "pending",
      completedAt: completedAt ? new Date(completedAt) : new Date(),
    },
  });

  // Create tasks from the tasks textarea (one per line)
  if (tasksRaw) {
    const lines = tasksRaw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      await prisma.task.createMany({
        data: lines.map((title) => ({
          clientProfileId: clientId,
          title,
          category: "session",
          priority: "medium",
          assignedTo: "founder",
          source: "call_notes",
        })),
      });
    }
  }

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}
