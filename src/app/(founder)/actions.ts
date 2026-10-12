"use server";

import { logout, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { runPulseAgent } from "@/lib/pulseAgent";

export async function logoutAction() {
  await logout();
}

export async function broadcastMessageAction(
  _prev: { error?: string; success?: string },
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await requireAuth("founder");
  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Message cannot be empty." };

  const clients = await prisma.clientProfile.findMany({ select: { id: true } });
  if (clients.length === 0) return { error: "No clients found." };

  await prisma.message.createMany({
    data: clients.map((c) => ({
      clientProfileId: c.id,
      senderId: session.id,
      senderRole: "founder",
      content,
      read: false,
    })),
  });

  revalidatePath("/dashboard");
  revalidatePath("/home");
  return { success: `Sent to ${clients.length} client${clients.length === 1 ? "" : "s"}.` };
}

export async function runPulseAgentAction() {
  await requireAuth("founder");
  const results = await runPulseAgent();
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  return results;
}

export async function resolveChurnRiskAction(riskId: string) {
  await requireAuth("founder");
  await prisma.churnRisk.update({
    where: { id: riskId },
    data: { resolved: true, resolvedAt: new Date() },
  });
  revalidatePath("/dashboard");
}
