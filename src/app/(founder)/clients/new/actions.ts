"use server";

import { requireAuth, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendInviteEmail } from "@/lib/email";
import crypto from "crypto";

type State = { error: string };

export async function createClient(_prev: State, formData: FormData): Promise<State> {
  const session = await requireAuth(["founder", "staff"]);

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
  const welcomeVideoUrl = (formData.get("welcomeVideoUrl") as string)?.trim() || null;
  const kickoffCallUrl = (formData.get("kickoffCallUrl") as string)?.trim() || null;
  const sendInviteNow = formData.get("sendInviteNow") === "on";
  const allFeatureKeys = ["health","tasks","goals","messages","roadmap","content-calendar","session-notes","deliverables","resources","check-in","social-strategy"];
  const enabledFeatures = formData.getAll("enabledFeatures") as string[];
  const hiddenTabs = allFeatureKeys.filter((k) => !enabledFeatures.includes(k));

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
          monthlyInvestment: monthlyInvestment ? parseFloat(monthlyInvestment) * 4 : null,
          businessContext: businessContext || null,
          personalityNotes: personalityNotes || null,
          communicationStyle: communicationStyle || null,
          welcomeVideoUrl,
          kickoffCallUrl,
          hiddenTabs,
          ownedByUserId: session.role === "staff" ? session.id : null,
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

  // Auto-create founder onboarding tasks
  const dueWeek1 = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.task.createMany({
    data: [
      {
        clientProfileId: clientId,
        title: `Send handwritten note + welcome gift to ${founderName}`,
        category: "onboarding",
        priority: "high",
        assignedTo: "founder",
      },
      {
        clientProfileId: clientId,
        title: `Send week 1 check-in message to ${founderName}`,
        category: "onboarding",
        priority: "medium",
        assignedTo: "founder",
        dueDate: dueWeek1,
      },
    ],
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
