import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "preview@pivotco.com.au" } });
  if (existing) {
    await prisma.message.deleteMany({ where: { senderId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
    console.log("Cleaned up existing preview client");
  }

  const password = await bcrypt.hash("preview123", 10);
  const startDate = new Date("2026-10-20");

  const user = await prisma.user.create({
    data: {
      email: "preview@pivotco.com.au",
      name: "Preview Client",
      password,
      role: "client",
      clientProfile: {
        create: {
          businessName: "Preview Business",
          founderName: "Preview Client",
          email: "preview@pivotco.com.au",
          tier: "GROWTH",
          startDate,
          currentMonth: 2,
          currentWeek: 3,
          isActive: true,
          onboardingComplete: true,
          package: "consulting",
          businessContext: "A test business used to preview the client portal.",
          weeklyFocus: "Reviewing the new portal features and making sure everything looks great.",
        },
      },
    },
    include: { clientProfile: true },
  });

  const profileId = user.clientProfile!.id;

  await prisma.goal.createMany({
    data: [
      { clientProfileId: profileId, title: "Hit $20k monthly revenue", progressPercent: 65, status: "active" },
      { clientProfileId: profileId, title: "Build a consistent content presence", progressPercent: 40, status: "active" },
    ],
  });

  await prisma.checkIn.createMany({
    data: [
      {
        clientProfileId: profileId,
        monthNumber: 1, weekNumber: 3,
        completed: "Finished the business audit and had the kickoff call. Set up my weekly review process.",
        notCompleted: "Didn't get to the content calendar",
        shifted: "Pushed the social strategy to next week",
        stuck: "Still figuring out my pricing tiers",
        energyScore: 8,
        energyNote: "Feeling motivated and clear on direction",
        createdAt: new Date("2026-10-27"),
      },
      {
        clientProfileId: profileId,
        monthNumber: 2, weekNumber: 1,
        completed: "Launched the new service page and sent it to 3 leads.",
        notCompleted: "Didn't film the reel I planned",
        shifted: "Reel moved to Thursday",
        stuck: "Email follow-up sequence still not done",
        energyScore: 7,
        energyNote: "Good week, a bit stretched thin by Friday",
        createdAt: new Date("2026-11-10"),
      },
    ],
  });

  await prisma.clientWin.createMany({
    data: [
      { clientProfileId: profileId, title: "Signed first $3k retainer client", category: "revenue", celebratedAt: new Date("2026-10-30") },
      { clientProfileId: profileId, title: "Hit 1,000 Instagram followers", category: "milestone", celebratedAt: new Date("2026-11-05") },
      { clientProfileId: profileId, title: "Finished the brand refresh", category: "milestone", celebratedAt: new Date("2026-11-12") },
    ],
  });

  await prisma.task.createMany({
    data: [
      { clientProfileId: profileId, title: "Film intro reel for Instagram", category: "content", priority: "high", assignedTo: "client" },
      { clientProfileId: profileId, title: "Send proposal to two warm leads", category: "sales", priority: "high", assignedTo: "client" },
      { clientProfileId: profileId, title: "Send handwritten note + welcome gift to Preview Client", category: "onboarding", priority: "high", assignedTo: "founder" },
    ],
  });

  await prisma.call.create({
    data: {
      clientProfileId: profileId,
      title: "Kickoff call",
      scheduledAt: new Date("2026-10-23T10:00:00"),
      completedAt: new Date("2026-10-23T11:00:00"),
      summaryContent: "Great first session. Covered business overview, identified the top 3 growth levers, and agreed on the focus for month 1.",
      keyDecisions: "Prioritise the sales page rewrite first. Defer the podcast to month 2.",
      nextSteps: "Client to send brand assets by EOW. Jess to send the content framework doc.",
    },
  });

  await prisma.call.create({
    data: {
      clientProfileId: profileId,
      title: "Monthly strategy session",
      scheduledAt: new Date("2026-11-25T10:00:00"),
    },
  });

  await prisma.message.create({
    data: {
      clientProfileId: profileId,
      senderId: user.id,
      senderRole: "founder",
      content: "Welcome to the Pivot Co portal! This is where we'll keep everything — your tasks, goals, check-ins, and session notes. Excited to work with you.",
      read: false,
    },
  });

  console.log("\n✓ Preview client created");
  console.log("  Email:    preview@pivotco.com.au");
  console.log("  Password: preview123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
