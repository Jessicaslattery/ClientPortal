import { prisma } from "../src/lib/db";

async function main() {
  // Clean up if already exists
  const existing = await prisma.user.findUnique({ where: { email: "client@pivotco.com.au" } });
  if (existing) {
    await prisma.user.delete({ where: { email: "client@pivotco.com.au" } });
    console.log("Deleted existing test user");
  }

  const user = await prisma.user.create({
    data: {
      email: "client@pivotco.com.au",
      name: "Sophie Brennan",
      // bcrypt hash of "Test" with cost 12
      password: "$2b$12$ZDE4wH4sjW3NskCb8rFFMOETpo/RD3yAbNerXP8xM6gHCdvcSTny2",
      role: "client",
      clientProfile: {
        create: {
          founderName: "Sophie Brennan",
          businessName: "The Brand Collective",
          email: "client@pivotco.com.au",
          phone: "+61 412 345 678",
          website: "https://thebrandcollective.com.au",
          birthday: new Date("1990-03-14"),
          tier: "Growth Partnership",
          startDate: new Date("2026-05-01"),
          currentMonth: 2,
          currentWeek: 3,
          monthlyInvestment: 2500,
          nextBillingDate: new Date("2026-07-01"),
          onboardingComplete: true,
          businessContext:
            "Sophie runs a boutique brand strategy consultancy helping mid-size fashion and lifestyle brands build distinctive market positioning. She works with 4–6 retainer clients at a time and is looking to scale to 8 clients without adding headcount.",
          personalityNotes:
            "Highly analytical but also deeply creative. Likes to see the data before committing to a direction. Responds well to frameworks and structured thinking. Can be perfectionistic — sometimes needs a nudge to ship.",
          communicationStyle:
            "Prefers concise written updates over long calls. Loves a good Loom video for complex concepts. Direct, no small talk.",
          nextSessionFocus:
            "Packaging her offer suite — turning one-off brand audits into a recurring retainer product.",
        },
      },
    },
    include: { clientProfile: true },
  });

  const clientId = user.clientProfile!.id;
  console.log("Created client profile:", clientId);

  // Business context intake
  await prisma.businessContextIntake.create({
    data: {
      clientProfileId: clientId,
      whatTheyDo: "Brand strategy consultancy for fashion and lifestyle brands",
      whoTheyServe: "Mid-size Australian fashion and lifestyle brands turning over $2M–$10M",
      currentRevenue: "$18,000/month",
      revenueGoal: "$30,000/month",
      biggestChallenge: "Scaling beyond founder-led delivery without diluting quality",
      whatIsWorking: "LinkedIn content — consistent inbound from ideal clients",
      whatIsNot: "Instagram is inconsistent and low ROI for her audience",
      contentPlatforms: "LinkedIn, Instagram",
      biggestPersonalBlock: "Letting go of control — struggles to delegate creative work",
      goalOne: "Build a scalable offer that doesn't require her in every delivery",
      goalTwo: "Grow to 8 retainer clients by December 2026",
      goalThree: "Take 4 weeks off in January 2027 without the business stalling",
      successIn6Months:
        "Has a clear productised service, a team member handling delivery, and consistent $28K+ months",
      submittedAt: new Date("2026-05-08"),
    },
  });

  // Onboarding steps — all complete
  await prisma.onboardingStep.createMany({
    data: [1, 2, 3, 4].map((step) => ({
      clientProfileId: clientId,
      step,
      status: "complete",
      completedAt: new Date("2026-05-08"),
    })),
  });

  // Goals
  await prisma.goal.createMany({
    data: [
      {
        clientProfileId: clientId,
        title: "Scale to 8 retainer clients",
        progressPercent: 35,
        status: "active",
        baselineNote: "Currently at 5 clients",
        targetNote: "8 retainer clients by December 2026",
      },
      {
        clientProfileId: clientId,
        title: "Productise the brand audit offer",
        progressPercent: 60,
        status: "active",
        baselineNote: "Draft framework complete",
        targetNote: "Packaged offer live and sold by August 2026",
      },
      {
        clientProfileId: clientId,
        title: "Hire junior strategist",
        progressPercent: 15,
        status: "active",
        baselineNote: "Job brief in progress",
        targetNote: "Hire in place and delivering client work by September 2026",
      },
    ],
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        clientProfileId: clientId,
        title: "Finalise service tier pricing",
        category: "strategy",
        priority: "high",
        assignedTo: "client",
        owner: "Sophie",
      },
      {
        clientProfileId: clientId,
        title: "Write case study — Fashion Week client",
        category: "content",
        priority: "medium",
        assignedTo: "client",
        owner: "Sophie",
      },
      {
        clientProfileId: clientId,
        title: "Review and send SOW to new prospect",
        category: "business",
        priority: "high",
        assignedTo: "founder",
        owner: "Jess",
      },
    ],
  });

  // Check-in — createdAt set to a past date so it's NOT detected as "this week"
  await prisma.checkIn.create({
    data: {
      clientProfileId: clientId,
      monthNumber: 2,
      weekNumber: 2,
      energyScore: 7,
      completed: "Finished the brand audit for my biggest client, sent proposals to two new prospects",
      notCompleted: "Did not get to the productised offer framework this week",
      shifted: "Deprioritised Instagram strategy — will revisit next month",
      stuck: "Unsure how to price the new productised tier without undercutting existing clients",
      energyNote: "Busy but motivated. Big client win this week gave me a boost.",
      createdAt: new Date("2026-06-10"),
    },
  });

  // A past call
  await prisma.call.create({
    data: {
      clientProfileId: clientId,
      title: "Month 2 Strategy Session",
      scheduledAt: new Date("2026-06-10T09:00:00"),
      completedAt: new Date("2026-06-10T10:00:00"),
    },
  });

  // Published social plan for June 2026
  await prisma.socialPlan.create({
    data: {
      clientProfileId: clientId,
      monthNumber: 6,
      year: 2026,
      status: "published",
      contentPillars:
        "Authority (35%) — Position Sophie as the go-to brand strategist for fashion & lifestyle\nPersonal Story (25%) — Behind-the-scenes of building a consultancy\nClient Results (25%) — Showcase transformations and wins from client work\nBehind the Business (15%) — Process, tools, and day-to-day reality",
      brandVoiceNotes:
        "Sophie's voice is confident, direct, and occasionally vulnerable. She positions herself as the straight-talking strategist — no fluff, just results. Tone: warm expertise. Never jargon-heavy. Always practical.",
      socialAudit:
        "May was the best month for LinkedIn — 3 posts hit 1,000+ impressions. Instagram remains inconsistent. Reels performed 40% better than static posts. Stories drove most DMs.",
      publishedAt: new Date("2026-06-01"),
    },
  });

  // Content posts for June 2026
  await prisma.contentPost.createMany({
    data: [
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-02"),
        contentType: "carousel",
        funnel: "top",
        topic: "Brand mistakes",
        hook: "5 brand mistakes costing you clients right now",
        hookType: "visual",
        planDetails:
          "I've audited 40+ fashion brands this year. These 5 mistakes show up every single time — and they're all fixable. Swipe to see if your brand is making them. Mistake #3 cost one of my clients $80K last year.",
        desiredOutcome: "save",
        status: "complete",
        createdBy: "founder",
        clientApproved: true,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-04"),
        contentType: "reel",
        funnel: "top",
        topic: "Personal story — the dip",
        hook: "I almost gave up on my consultancy 18 months ago",
        hookType: "audio",
        planDetails:
          "Nobody talks about the dip. The moment between 'I'm building something' and 'it's actually working.' This is mine. Sitting in my car in a Westfield carpark, second-guessing everything.",
        desiredOutcome: "save",
        status: "complete",
        createdBy: "founder",
        clientApproved: true,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-09"),
        contentType: "picture",
        funnel: "bottom",
        topic: "Client results",
        hook: "My client went from $12K to $22K months in 90 days. Here's what changed:",
        hookType: "visual",
        planDetails:
          "Not a rebrand. Not a new website. Just clarity on who they were for, what they charged, and how they talked about it. Strategy, not aesthetics. She nearly quit before we started.",
        desiredOutcome: "dm",
        status: "complete",
        createdBy: "founder",
        clientApproved: true,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-11"),
        contentType: "carousel",
        funnel: "middle",
        topic: "3-layer brand framework",
        hook: "The 3-layer brand framework I use with every client",
        hookType: "visual",
        planDetails:
          "Layer 1: Who you're for. Layer 2: What you stand for. Layer 3: How you show up. Most brands nail one. The best brands nail all three.",
        desiredOutcome: "save",
        status: "working_on_it",
        createdBy: "founder",
        clientApproved: true,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-16"),
        contentType: "reel",
        funnel: "top",
        topic: "Brand consistency",
        hook: "Why your brand feels inconsistent (and it's not the designer's fault)",
        hookType: "audio",
        planDetails:
          "Every time I hear 'we just need a brand refresh' I know what's really happening. The problem isn't visual — it's strategic. Here's how to fix it.",
        desiredOutcome: "share",
        status: "working_on_it",
        createdBy: "founder",
        clientApproved: true,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-18"),
        contentType: "reel",
        funnel: "middle",
        topic: "Behind the business",
        hook: "A day in my life as a brand consultant (the real version)",
        hookType: "audio",
        planDetails:
          "Client calls, strategy docs, LinkedIn posts, invoices, and one very neglected inbox. This is what a Tuesday actually looks like. Filmed impulsively after a 4-hour strategy session.",
        desiredOutcome: "comment",
        status: "working_on_it",
        createdBy: "founder",
        clientApproved: false,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-23"),
        contentType: "carousel",
        funnel: "bottom",
        topic: "Before & after repositioning",
        hook: "Before & after: how we repositioned a $3M lifestyle brand in 6 weeks",
        hookType: "visual",
        planDetails:
          "They had a beautiful product and a confused brand. Six weeks, three workshops, and one hard conversation about who they were NOT for. The CEO cried in our third session.",
        desiredOutcome: "dm",
        status: "todo",
        createdBy: "founder",
        clientApproved: false,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-25"),
        contentType: "picture",
        funnel: "top",
        topic: "Running a consultancy",
        hook: "The hardest thing about running a consultancy nobody warns you about",
        hookType: "visual",
        planDetails:
          "You become the product. Your reputation, your thinking, your energy. There's no separating you from the work. Wrote this at 6am after a run.",
        desiredOutcome: "share",
        status: "todo",
        createdBy: "client",
        clientApproved: true,
      },
      {
        clientProfileId: clientId,
        month: "2026-06",
        postDate: new Date("2026-06-30"),
        contentType: "picture",
        funnel: "top",
        topic: "Monthly reflection",
        hook: "June reflection: what the data told me about building in public",
        hookType: "visual",
        planDetails:
          "3 months of posting consistently on LinkedIn. Here's what performed, what flopped, and what I'd do differently.",
        desiredOutcome: "comment",
        status: "todo",
        createdBy: "client",
        clientApproved: true,
      },
    ],
  });

  console.log("✓ Test client seeded successfully");
  console.log("  Email:    client@pivotco.com.au");
  console.log("  Password: Test");
}

main().catch(console.error).finally(() => prisma.$disconnect());
