"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createReminderAction(formData: FormData) {
  await requireAuth("founder");
  await prisma.reminderTemplate.create({
    data: {
      title: (formData.get("title") as string).trim(),
      message: (formData.get("message") as string).trim(),
      dayOfWeek: formData.get("dayOfWeek") as string,
      audience: formData.get("audience") as string,
      active: true,
    },
  });
  revalidatePath("/inbox");
}

export async function toggleReminderAction(id: string, active: boolean) {
  await requireAuth("founder");
  await prisma.reminderTemplate.update({ where: { id }, data: { active } });
  revalidatePath("/inbox");
}

export async function deleteReminderAction(id: string) {
  await requireAuth("founder");
  await prisma.reminderTemplate.delete({ where: { id } });
  revalidatePath("/inbox");
}

export async function sendReminderNowAction(reminderId: string) {
  const session = await requireAuth("founder");
  const founderId = session.id;

  const reminder = await prisma.reminderTemplate.findUnique({ where: { id: reminderId } });
  if (!reminder) return { error: "Reminder not found" };

  const where =
    reminder.audience === "all"
      ? { isActive: true }
      : reminder.audience === "consulting"
      ? { isActive: true, package: "consulting" }
      : reminder.audience === "sms"
      ? { isActive: true, package: "sms" }
      : { isActive: true };

  const clients = await prisma.clientProfile.findMany({
    where,
    include: { user: { select: { email: true } } },
  });

  const results = await Promise.allSettled(
    clients.map(async (client) => {
      const personalised = reminder.message.replace(/\{firstName\}/g, client.founderName.split(" ")[0]);
      await prisma.message.create({
        data: {
          clientProfileId: client.id,
          senderId: founderId,
          content: personalised,
          senderRole: "founder",
          read: false,
        },
      });
      await prisma.reminderSent.create({
        data: {
          reminderTemplateId: reminderId,
          clientProfileId: client.id,
          status: "sent",
        },
      });
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  revalidatePath("/inbox");
  return { sent: clients.length - failed, failed };
}
