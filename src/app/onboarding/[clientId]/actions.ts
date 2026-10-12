"use server";

import { prisma } from "@/lib/db";
import { runOnboardingAgent } from "@/lib/agents/onboarding-agent";
import { redirect } from "next/navigation";

type IntakeData = {
  businessName: string;
  whatTheyDo: string;
  whoTheyServe: string;
  howLongTrading: string;
  currentRevenue: string;
  revenueGoal: string;
  biggestChallenge: string;
  whatTheyTried: string;
  whatIsWorking: string;
  whatIsNot: string;
  currentTools: string;
  teamSituation: string;
  contentPlatforms: string;
  workingHoursPerWeek: number | null;
  energyLevel: number | null;
  biggestPersonalBlock: string;
  goalOne: string;
  goalTwo: string;
  goalThree: string;
  successIn6Months: string;
  personalStory: string;
  clientsFeedback: string;
  industryBelief: string;
  dailyRoutine: string;
  mostProudOf: string;
};

export async function submitIntakeForm(clientId: string, data: IntakeData) {
  const profile = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    select: { id: true, tier: true, founderName: true },
  });

  if (!profile) throw new Error("Client not found");

  await prisma.businessContextIntake.update({
    where: { clientProfileId: clientId },
    data: {
      ...data,
      submittedAt: new Date(),
    },
  });

  // Create 3 Goal records from intake goals
  const goals = [data.goalOne, data.goalTwo, data.goalThree].filter(Boolean);
  await prisma.goal.createMany({
    data: goals.map((title) => ({
      clientProfileId: clientId,
      title,
      progressPercent: 0,
      status: "active",
    })),
  });

  // Create starter tasks based on tier
  type TaskEntry = { title: string; category: string };
  const foundationsTasks: TaskEntry[] = [
    { title: "Define your core offer and pricing", category: "Brand" },
    { title: "Set up your weekly content schedule", category: "Content" },
    { title: "Map your client onboarding process", category: "Operations" },
    { title: "Write your outreach message templates", category: "Sales" },
    { title: "Create your client welcome sequence", category: "Client Experience" },
  ];
  const coreTasks: TaskEntry[] = [
    ...foundationsTasks,
    { title: "Set up your lead tracking system", category: "Sales" },
    { title: "Build your VA workflow and brief", category: "Operations" },
  ];
  const operatorTasks: TaskEntry[] = [
    ...coreTasks,
    { title: "Map all revenue streams", category: "Operations" },
    { title: "Create team task delegation system", category: "Operations" },
    { title: "Build your launch planning framework", category: "Brand" },
  ];

  const tierMap: Record<string, TaskEntry[]> = {
    FOUNDATIONS: foundationsTasks,
    CORE: coreTasks,
    OPERATOR: operatorTasks,
  };

  const tasks = tierMap[profile.tier.toUpperCase()] ?? coreTasks;

  await prisma.task.createMany({
    data: tasks.map((t) => ({
      clientProfileId: clientId,
      title: t.title,
      category: t.category,
      source: "onboarding",
      priority: "medium",
    })),
  });

  // Mark onboarding step 2 complete
  await prisma.onboardingStep.updateMany({
    where: { clientProfileId: clientId, step: 2 },
    data: { status: "complete", completedAt: new Date() },
  });

  // Run step 3 — intake received acknowledgement (queued as pending draft)
  try {
    const { agentDraftId } = await runOnboardingAgent(clientId, 3);
    await prisma.onboardingStep.updateMany({
      where: { clientProfileId: clientId, step: 3 },
      data: { agentDraftId },
    });
  } catch (err) {
    console.error("Onboarding step 3 agent failed:", err);
  }

  // Notify founder: create a system message flagging the intake submission
  const founder = await prisma.user.findFirst({ where: { role: "founder" } });
  const client = await prisma.user.findFirst({
    where: { clientProfile: { id: clientId } },
    select: { id: true },
  });
  if (founder && client) {
    await prisma.message.create({
      data: {
        clientProfileId: clientId,
        senderId: client.id,
        senderRole: "client",
        content: `[INTAKE SUBMITTED] ${profile.founderName} has completed the business context intake form. Review it in the Onboarding tab on their profile.`,
        read: false,
      },
    });
  }

  redirect(`/onboarding/${clientId}/thank-you`);
}
