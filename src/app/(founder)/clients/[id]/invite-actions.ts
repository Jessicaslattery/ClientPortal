"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";
import crypto from "crypto";

export async function sendClientInviteAction(
  clientProfileId: string
): Promise<{ success?: string; error?: string }> {
  await requireAuth("founder");

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientProfileId },
    select: { founderName: true, email: true },
  });

  if (!client) return { error: "Client not found." };

  try {
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Delete any existing tokens for this email first
    await prisma.verificationToken.deleteMany({
      where: { identifier: client.email },
    });

    await prisma.verificationToken.create({
      data: { identifier: client.email, token: inviteToken, expires },
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${appUrl}/set-password/${inviteToken}`;
    const firstName = client.founderName.split(" ")[0];

    await sendInviteEmail({ to: client.email, firstName, inviteUrl });

    return { success: `Invite sent to ${client.email}` };
  } catch (err) {
    console.error("Send invite failed:", err);
    return { error: "Failed to send invite. Check your Resend API key." };
  }
}
