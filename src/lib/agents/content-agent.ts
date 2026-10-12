import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are the Pivot Co. Content Agent. You generate personalised social media content plans built from real client data.

Return VALID JSON ONLY: no preamble, no markdown:

{
  "month": "string: YYYY-MM",
  "clientName": "string",
  "posts": [
    {
      "postDate": "string: ISO date",
      "contentType": "string: reel | carousel | picture",
      "funnel": "string: top | middle | bottom — where this sits in the funnel",
      "topic": "string: what this piece is about",
      "hook": "string: the opening line, must stop the scroll",
      "hookType": "string: visual | audio — how the hook is delivered",
      "planDetails": "string: the plan/structure for this piece — talking points, shots, structure",
      "desiredOutcome": "string: save | share | comment | dm | likes — the primary outcome this piece is built for"
    }
  ],
  "strategyNote": "string: one paragraph on the overall content strategy for this client this month"
}

Rules:
- Every post must reference something real from the client data provided
- Hooks must be specific, never generic
- Vary content types, funnel stages, and desired outcomes across the month
- Posts should feel like they were written by the client, not a generic social media manager
- Australian English
- Aim for 3-4 posts per week (roughly 12-16 posts for the month)
- Keep planDetails concise — a short paragraph, not an essay`;

function getPostCadence(tier: string): number {
  switch (tier.toUpperCase()) {
    case "OPERATOR":
      return 16;
    case "CORE":
      return 14;
    case "FOUNDATIONS":
    default:
      return 12;
  }
}

export async function generateContentPlan(
  clientId: string,
  month: string // YYYY-MM
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const [profile, intake, analytics] = await Promise.all([
    prisma.clientProfile.findUniqueOrThrow({
      where: { id: clientId },
      include: {
        goals: { where: { status: "active" } },
        checkIns: { orderBy: { createdAt: "desc" }, take: 4 },
        tasks: { where: { completed: true }, orderBy: { completedAt: "desc" }, take: 10 },
        calls: {
          where: { completedAt: { not: null } },
          orderBy: { completedAt: "desc" },
          take: 3,
          select: { summaryContent: true, title: true, completedAt: true },
        },
        businessContext_: true,
      },
    }),
    prisma.businessContextIntake.findUnique({ where: { clientProfileId: clientId } }),
    prisma.contentAnalytics.findMany({
      where: { clientProfileId: clientId },
      orderBy: { weekOf: "desc" },
      take: 8,
    }),
  ]);

  const targetPosts = getPostCadence(profile.tier);

  const ctx: string[] = [];
  ctx.push(`CLIENT: ${profile.founderName}`);
  ctx.push(`BUSINESS: ${profile.businessName}`);
  ctx.push(`TIER: ${profile.tier}`);
  ctx.push(`NICHE: ${profile.businessContext ?? "Not specified"}`);
  ctx.push(`TONE OF VOICE: ${profile.communicationStyle ?? "Not specified"}`);
  ctx.push(`TARGET POSTS THIS MONTH: ${targetPosts}`);
  ctx.push(`MONTH TO PLAN: ${month}`);

  if (profile.goals.length > 0) {
    ctx.push(`\nACTIVE GOALS:`);
    for (const g of profile.goals) {
      ctx.push(`• ${g.title}: ${g.progressPercent}% complete${g.description ? ` (${g.description})` : ""}`);
    }
  }

  const wins = profile.tasks.filter((t) => t.completedAt);
  if (wins.length > 0) {
    ctx.push(`\nRECENT WINS (completed tasks):`);
    ctx.push(wins.slice(0, 6).map((t) => `• ${t.title}`).join("\n"));
  }

  if (profile.checkIns.length > 0) {
    ctx.push(`\nRECENT CHECK-IN THEMES:`);
    for (const c of profile.checkIns) {
      ctx.push(`M${c.monthNumber}W${c.weekNumber} (energy ${c.energyScore}/10): ${c.completed}. Stuck: ${c.stuck}. Shift: ${c.shifted}`);
    }
  }

  if (intake) {
    ctx.push(`\nPERSONAL INTAKE HOOKS (use these to make content feel real and personal):`);
    if (intake.personalStory) ctx.push(`Personal story: ${intake.personalStory}`);
    if (intake.industryBelief) ctx.push(`Strong belief: ${intake.industryBelief}`);
    if (intake.mostProudOf) ctx.push(`Most proud of: ${intake.mostProudOf}`);
    if (intake.clientsFeedback) ctx.push(`What clients say: ${intake.clientsFeedback}`);
    if (intake.dailyRoutine) ctx.push(`Daily routine: ${intake.dailyRoutine}`);
    if (intake.biggestChallenge) ctx.push(`Biggest challenge overcome: ${intake.biggestChallenge}`);
    if (intake.whoTheyServe) ctx.push(`Ideal client: ${intake.whoTheyServe}`);
    if (intake.whatTheyDo) ctx.push(`What they do: ${intake.whatTheyDo}`);
  }

  if (profile.calls.length > 0) {
    ctx.push(`\nRECENT SESSION TALKING POINTS:`);
    for (const call of profile.calls) {
      if (call.summaryContent) {
        ctx.push(`• ${call.title}: ${call.summaryContent.slice(0, 200)}`);
      }
    }
  }

  if (analytics.length > 0) {
    ctx.push(`\nWHAT HAS WORKED (analytics):`);
    const byPlatform = new Map<string, typeof analytics>();
    for (const a of analytics) {
      if (!byPlatform.has(a.platform)) byPlatform.set(a.platform, []);
      byPlatform.get(a.platform)!.push(a);
    }
    for (const [platform, rows] of byPlatform) {
      const best = rows[0];
      ctx.push(`${platform}: Top format = ${best.topFormat}, Top post = "${best.topPost}", Avg engagement = ${best.engagementRate}%`);
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a full monthly content plan for ${month}.\n\n${ctx.join("\n")}`,
      },
    ],
  });

  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");

  let parsed: {
    month: string;
    clientName: string;
    strategyNote: string;
    posts: Array<{
      postDate: string;
      contentType: string;
      funnel: string;
      topic: string;
      hook: string;
      hookType: string;
      planDetails: string;
      desiredOutcome: string;
    }>;
  };

  const raw = block.text.replace(/^```[\w]*\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Content Agent returned invalid JSON: ${raw.slice(0, 200)}`);
  }

  // Save each post to ContentPost
  if (parsed.posts?.length) {
    await prisma.contentPost.createMany({
      data: parsed.posts.map((post) => ({
        clientProfileId: clientId,
        month,
        postDate: new Date(post.postDate),
        contentType: post.contentType,
        funnel: post.funnel,
        topic: post.topic,
        hook: post.hook,
        hookType: post.hookType,
        planDetails: post.planDetails,
        desiredOutcome: post.desiredOutcome,
        status: "todo",
        createdBy: "founder",
        clientApproved: false,
      })),
    });
  }

  // Save AgentDraft for founder review
  const [year, monthNum] = month.split("-");
  const monthLabel = new Date(parseInt(year), parseInt(monthNum) - 1, 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  await prisma.agentDraft.create({
    data: {
      clientProfileId: clientId,
      type: "content_plan",
      title: `Content Plan: ${profile.founderName}, ${monthLabel}`,
      status: "pending",
      context: `Generated for ${monthLabel}. ${parsed.posts?.length ?? 0} posts. ${parsed.strategyNote ?? ""}`,
      content: raw,
    },
  });

  return block.text;
}
