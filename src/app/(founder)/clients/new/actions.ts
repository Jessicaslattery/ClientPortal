"use server";

import { requireAuth, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendInviteEmail } from "@/lib/email";
import crypto from "crypto";

type State = { error: string };

export async function createClient(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const founderName = formData.get("founderName") as string;
  const businessName = formData.get("businessName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const instagram = (formData.get("instagram") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const leadSource = (formData.get("leadSource") as string)?.trim() || null;
  const packageName = (formData.get("packageName") as string)?.trim();
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = (formData.get("endDate") as string)?.trim();
  const birthdayStr = formData.get("birthday") as string;
  const monthlyInvestment = formData.get("monthlyInvestment") as string;
  const businessContext = formData.get("businessContext") as string;
  const personalityNotes = formData.get("personalityNotes") as string;
  const communicationStyle = formData.get("communicationStyle") as string;
  const sendInviteNow = formData.get("sendInviteNow") === "on";

  if (!founderName || !businessName || !email) {
    return { error: "Please fill in all required fields." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "A user with this email already exists." };
  }

  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const daysSinceStart = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalWeeks = Math.floor(daysSinceStart / 7);
  const currentMonth = Math.floor(totalWeeks / 4) + 1;
  const currentWeek = (totalWeeks % 4) + 1;

  // Random placeholder password — client sets their own via the invite link
  const hashedPassword = await hashPassword(crypto.randomBytes(32).toString("hex"));

  const user = await prisma.user.create({
    data: {
      email,
      name: founderName,
      password: hashedPassword,
      role: "client",
      clientProfile: {
        create: {
          founderName,
          businessName,
          email,
          phone: phone || null,
          website: website || null,
          instagram,
          address,
          leadSource,
          birthday: birthdayStr ? new Date(birthdayStr) : null,
          tier: packageName || "GROWTH",
          startDate,
          endDate: endDateStr ? new Date(endDateStr) : null,
          isActive: endDateStr ? false : true,
          currentMonth,
          currentWeek,
          monthlyInvestment: monthlyInvestment ? parseFloat(monthlyInvestment) : null,
          businessContext: businessContext || null,
          personalityNotes: personalityNotes || null,
          communicationStyle: communicationStyle || null,
        },
      },
    },
    include: { clientProfile: true },
  });

  const clientId = user.clientProfile!.id;

  // Create blank intake record and onboarding steps
  await prisma.businessContextIntake.create({
    data: { clientProfileId: clientId },
  });

  await prisma.onboardingStep.createMany({
    data: [1, 2, 3, 4].map((step) => ({
      clientProfileId: clientId,
      step,
      status: "pending",
    })),
  });

  // Send invite email only if requested
  if (sendInviteNow) {
    try {
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await prisma.verificationToken.upsert({
        where: { token: inviteToken },
        create: { identifier: email, token: inviteToken, expires },
        update: { expires },
      });
      const appUrl = process.env.APP_URL ?? "http://localhost:3000";
      const inviteUrl = `${appUrl}/set-password/${inviteToken}`;
      await sendInviteEmail({ to: email, firstName: founderName.split(" ")[0], inviteUrl });
    } catch (err) {
      console.error("Invite email failed:", err);
    }
  }

  revalidatePath("/clients");
  redirect("/clients");
}
