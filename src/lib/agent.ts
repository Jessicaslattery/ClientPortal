import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to your .env file.");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function generate(system: string, user: string): Promise<string> {
  const client = getClient();
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}

// ─── Pre-call Brief ─────────────────────────────────────────────────────────

export async function generatePreCallBrief(clientProfileId: string): Promise<string> {
  const profile = await prisma.clientProfile.findUniqueOrThrow({
    where: { id: clientProfileId },
    include: {
      checkIns: { orderBy: { createdAt: "desc" }, take: 3 },
      calls: { orderBy: { scheduledAt: "desc" }, take: 3 },
      goals: true,
      tasks: { where: { completed: false }, take: 8 },
    },
  });

  const latestCheckIn = profile.checkIns[0];
  const lastCompletedCall = profile.calls.find((c) => c.completedAt);

  const contextParts: string[] = [];
  contextParts.push(`CLIENT: ${profile.founderName}`);
  contextParts.push(`BUSINESS: ${profile.businessName}`);
  contextParts.push(`PHASE: ${profile.currentPhase}, Month ${profile.currentMonth}, Week ${profile.currentWeek}`);
  if (profile.businessContext) contextParts.push(`\nBUSINESS CONTEXT:\n${profile.businessContext}`);
  if (profile.personalityNotes) contextParts.push(`\nPERSONALITY:\n${profile.personalityNotes}`);
  if (profile.communicationStyle) contextParts.push(`\nCOMMUNICATION STYLE:\n${profile.communicationStyle}`);
  if (profile.weeklyFocus) contextParts.push(`\nCURRENT WEEKLY FOCUS:\n${profile.weeklyFocus}`);

  if (profile.goals.length > 0) {
    contextParts.push(`\nGOALS:\n${profile.goals.map((g) => `• ${g.title}: ${g.progressPercent}% progress`).join("\n")}`);
  }

  if (profile.tasks.length > 0) {
    contextParts.push(`\nOPEN TASKS:\n${profile.tasks.map((t) => `• [${t.priority}] ${t.title}`).join("\n")}`);
  }

  if (latestCheckIn) {
    contextParts.push(`\nLATEST CHECK-IN (M${latestCheckIn.monthNumber}W${latestCheckIn.weekNumber}, energy ${latestCheckIn.energyScore}/10):`);
    contextParts.push(`Completed: ${latestCheckIn.completed}`);
    contextParts.push(`Not completed: ${latestCheckIn.notCompleted}`);
    contextParts.push(`Stuck: ${latestCheckIn.stuck}`);
    contextParts.push(`Shifted: ${latestCheckIn.shifted}`);
    if (latestCheckIn.callNotes) contextParts.push(`Call notes: ${latestCheckIn.callNotes}`);
  }

  if (lastCompletedCall?.summaryContent) {
    contextParts.push(`\nLAST CALL SUMMARY:\n${lastCompletedCall.summaryContent}`);
    if (lastCompletedCall.nextSteps) {
      const steps = JSON.parse(lastCompletedCall.nextSteps as string) as string[];
      contextParts.push(`Next steps from last call:\n${steps.map((s) => `• ${s}`).join("\n")}`);
    }
  }

  const system = `You are a strategic business coach preparing a pre-call brief for Jess, founder of Pivot Co., ahead of a premium consultancy session. Your briefs are precise, insightful, and give Jess exactly what she needs to run a high-value call.

Use the following exact structure with ALL CAPS section headers. Be direct and specific. Address Jess directly - use "Sarah has..." not "The client has...". Flag missing data clearly rather than guessing. Australian English throughout.

CLIENT SNAPSHOT
[Name, tier, programme phase, month and week number]
[One sentence: the headline story for this client right now]

SINCE LAST CALL
[Tasks completed this week and tasks that are overdue]
[Check-in energy score and key themes from their responses]
[Any messages worth noting]
[Flag clearly if any of this data is missing]

GRANOLA CONTEXT
[Key decisions from the last 2 calls]
[Any commitments made that remain unresolved]
[Recurring patterns or themes across sessions]
[If no Granola transcript data is available: state "No Granola data available for recent sessions"]

THIS WEEK'S FOCUS
[The single most important thing to address on this call (be opinionated)]
[3–5 talking points in priority order]
[Any risks, sensitivities or things to watch for]

QUICK NUMBERS
[Revenue vs weekly target this week if data exists]
[Any metric that moved significantly since the last call]
[If no scorecard data: state "No scorecard data logged this week"]`;

  const user = `Generate a pre-call brief using this client data:\n\n${contextParts.join("\n")}`;

  const content = await generate(system, user);

  await prisma.agentDraft.create({
    data: {
      clientProfileId,
      type: "pre-call-brief",
      title: `Pre-call Brief: ${profile.founderName}, M${profile.currentMonth}W${profile.currentWeek}`,
      status: "pending",
      context: `Generated from: ${latestCheckIn ? `M${latestCheckIn.monthNumber}W${latestCheckIn.weekNumber} check-in` : "profile data"}${lastCompletedCall ? " + last call summary" : ""} + client profile`,
      content,
    },
  });

  return content;
}

// ─── Session Summary ─────────────────────────────────────────────────────────

export type SessionSummaryJSON = {
  sessionSummary: string;
  keyDecisions: string[];
  actionItems: Array<{
    name: string;
    category: "Brand" | "Content" | "Operations" | "Sales" | "Retention" | "Client Experience";
    owner: "Client" | "Jess" | "VA";
  }>;
  goalUpdates: Array<{
    goalName: string;
    newProgress: number;
    note: string;
  }>;
  nextSessionFocus: string;
};

export async function generateSessionSummary(
  clientProfileId: string,
  callId: string,
  transcript: string
): Promise<string> {
  const [profile, call] = await Promise.all([
    prisma.clientProfile.findUniqueOrThrow({
      where: { id: clientProfileId },
      include: { goals: { where: { status: "active" } } },
    }),
    prisma.call.findUniqueOrThrow({ where: { id: callId } }),
  ]);

  const goalList = profile.goals.length > 0
    ? `\nActive goals:\n${profile.goals.map((g) => `• ${g.title} (currently ${g.progressPercent}%)`).join("\n")}`
    : "";

  const system = `You are a strategic business coach writing a post-session summary for a premium client portal. Return VALID JSON ONLY - no markdown, no code fences, just raw JSON.

Return this exact structure:
{
  "sessionSummary": "string: client-facing, warm, second person, starts with 'In today's session we...' Encouraging and specific. Australian English. 3–4 sentences.",
  "keyDecisions": ["string: be specific not vague, 2–5 items"],
  "actionItems": [
    {
      "name": "string: clear actionable task",
      "category": "Brand|Content|Operations|Sales|Retention|Client Experience",
      "owner": "Client|Jess|VA"
    }
  ],
  "goalUpdates": [
    {
      "goalName": "string: must match an existing goal name exactly",
      "newProgress": 0,
      "note": "string: why this progress was made"
    }
  ],
  "nextSessionFocus": "string: one sentence on the single most important focus for next session"
}

Rules:
- Only include goalUpdates for goals that were explicitly discussed and where progress was made
- actionItems should be concrete and specific, not vague
- Australian English throughout
- sessionSummary must start with "In today's session we"`;

  const user = `Generate a session summary for this call.

Client: ${profile.founderName} (${profile.businessName})
Tier: ${profile.tier}
Phase: ${profile.currentPhase}, Month ${profile.currentMonth}, Week ${profile.currentWeek}
Call: ${call.title}
${goalList}

Session transcript/notes:
${transcript}`;

  const raw = await generate(system, user);

  // Store the raw JSON string directly: the approval action will parse it
  await prisma.agentDraft.create({
    data: {
      clientProfileId,
      callId,
      type: "session-summary",
      title: `Session Summary: ${profile.founderName}: ${call.title}`,
      status: "pending",
      context: `Generated from session transcript for: ${call.title}`,
      content: raw,
    },
  });

  return raw;
}

// ─── Social Plan ─────────────────────────────────────────────────────────────

export async function generateSocialPlan(clientProfileId: string): Promise<string> {
  const profile = await prisma.clientProfile.findUniqueOrThrow({
    where: { id: clientProfileId },
    include: {
      goals: true,
      socialPlans: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const now = new Date();
  const monthName = now.toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  const contextParts: string[] = [];
  contextParts.push(`CLIENT: ${profile.founderName}`);
  contextParts.push(`BUSINESS: ${profile.businessName}`);
  contextParts.push(`PHASE: ${profile.currentPhase}`);
  if (profile.businessContext) contextParts.push(`\nBUSINESS CONTEXT:\n${profile.businessContext}`);
  if (profile.goals.length > 0) {
    contextParts.push(`\nCURRENT GOALS:\n${profile.goals.map((g) => `• ${g.title} (${g.progressPercent}%)`).join("\n")}`);
  }

  const prevPlan = profile.socialPlans[0];
  if (prevPlan?.brandVoiceNotes) {
    contextParts.push(`\nBRAND VOICE (from previous plan):\n${prevPlan.brandVoiceNotes}`);
  }
  if (prevPlan?.contentPillars) {
    contextParts.push(`\nCONTENT PILLARS (from previous plan):\n${prevPlan.contentPillars}`);
  }
  if (prevPlan?.socialAudit) {
    contextParts.push(`\nPREVIOUS MONTH AUDIT:\n${prevPlan.socialAudit}`);
  }

  const system = `You are a strategic content director creating a monthly social media plan for a premium founder-led business. Plans are specific, opinionated, and built around the client's actual goals: never generic.

Structure your output with these exact sections:
BRAND VOICE NOTES: how this brand should sound and feel this month
CONTENT PILLARS: 4 pillars with percentage split and rationale
STORY OUTLINES: daily story outline for weeks 1 and 2
DAILY POSTING GUIDE: posting rhythm, tone, what to avoid
SOCIAL AUDIT: brief analysis of what's working and what to change

Be concrete and specific. No filler language.`;

  const user = `Generate a social media plan for ${monthName}.

${contextParts.join("\n")}`;

  const content = await generate(system, user);

  await prisma.agentDraft.create({
    data: {
      clientProfileId,
      type: "social-plan",
      title: `Social Plan: ${profile.founderName}, ${monthName}`,
      status: "pending",
      context: `Generated for ${monthName} from client profile and goals`,
      content,
    },
  });

  return content;
}

// ─── Progress Report ─────────────────────────────────────────────────────────

export async function generateProgressReport(clientProfileId: string): Promise<string> {
  const profile = await prisma.clientProfile.findUniqueOrThrow({
    where: { id: clientProfileId },
    include: {
      goals: { include: { progressNotes: { orderBy: { createdAt: "desc" }, take: 3 } } },
      checkIns: { orderBy: { createdAt: "desc" }, take: 8 },
      calls: { where: { completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 5 },
      tasks: { where: { completed: true }, orderBy: { updatedAt: "desc" }, take: 10 },
    },
  });

  const avgEnergy =
    profile.checkIns.length > 0
      ? (profile.checkIns.reduce((sum, c) => sum + (c.energyScore || 0), 0) / profile.checkIns.length).toFixed(1)
      : null;

  const contextParts: string[] = [];
  contextParts.push(`CLIENT: ${profile.founderName}`);
  contextParts.push(`BUSINESS: ${profile.businessName}`);
  contextParts.push(`PHASE: ${profile.currentPhase}, Month ${profile.currentMonth}, Week ${profile.currentWeek}`);
  if (profile.businessContext) contextParts.push(`\nBUSINESS CONTEXT:\n${profile.businessContext}`);

  if (profile.goals.length > 0) {
    contextParts.push("\nGOALS & PROGRESS:");
    for (const goal of profile.goals) {
      contextParts.push(`• ${goal.title}: ${goal.progressPercent}%`);
      if (goal.baselineNote) contextParts.push(`  Baseline: ${goal.baselineNote}`);
      if (goal.targetNote) contextParts.push(`  Target: ${goal.targetNote}`);
    }
  }

  if (profile.checkIns.length > 0) {
    contextParts.push(`\nCHECK-IN HISTORY (${profile.checkIns.length} submitted, avg energy ${avgEnergy}/10):`);
    for (const c of profile.checkIns.slice(0, 4)) {
      contextParts.push(`\nM${c.monthNumber}W${c.weekNumber} (energy ${c.energyScore}/10):`);
      contextParts.push(`  Completed: ${c.completed}`);
      contextParts.push(`  Stuck: ${c.stuck}`);
      contextParts.push(`  Shifted: ${c.shifted}`);
    }
  }

  if (profile.calls.length > 0) {
    contextParts.push(`\nCALLS COMPLETED: ${profile.calls.length}`);
    const lastCall = profile.calls[0];
    if (lastCall.summaryContent) {
      contextParts.push(`Last call summary: ${lastCall.summaryContent.slice(0, 300)}…`);
    }
  }

  if (profile.tasks.length > 0) {
    contextParts.push(`\nCOMPLETED TASKS (recent): ${profile.tasks.slice(0, 6).map((t) => t.title).join(", ")}`);
  }

  const system = `You are a strategic business coach writing a progress report for a client. Reports are honest, specific, and motivating: they show the client where they've come from and what's possible.

Structure your output with these sections:
SUMMARY: 3-4 sentences on overall progress this period
GOAL PROGRESS: analysis of each goal: what's moved, what hasn't, why
ENERGY & MOMENTUM: pattern analysis from weekly check-ins
RECURRING THEMES: 2-3 patterns you've observed across check-ins
WHAT'S WORKING: specific wins and areas of genuine progress
AREAS TO WATCH: honest assessment of what needs attention
RECOMMENDED FOCUS: 2-3 priority areas for the next period

Write in second person ("you've made progress", "you consistently"). Be specific: reference actual data. Tone: honest, warm, forward-looking.`;

  const user = `Generate a progress report.\n\n${contextParts.join("\n")}`;

  const content = await generate(system, user);

  await prisma.agentDraft.create({
    data: {
      clientProfileId,
      type: "progress-report",
      title: `Progress Report: ${profile.founderName}, M${profile.currentMonth}W${profile.currentWeek}`,
      status: "pending",
      context: `Generated from ${profile.checkIns.length} check-ins, ${profile.calls.length} calls, and goal progress data`,
      content,
    },
  });

  return content;
}

// ─── Onboarding Context Generator ────────────────────────────────────────────

export async function generateOnboardingContext(clientProfileId: string): Promise<string> {
  const [profile, intake] = await Promise.all([
    prisma.clientProfile.findUniqueOrThrow({
      where: { id: clientProfileId },
      include: { goals: true },
    }),
    prisma.businessContextIntake.findUnique({ where: { clientProfileId } }),
  ]);

  if (!intake) throw new Error("No intake form found for this client.");

  const fields: string[] = [];
  const add = (label: string, val: string | null | undefined) => {
    if (val?.trim()) fields.push(`${label}: ${val.trim()}`);
  };

  add("Business name", intake.businessName);
  add("What they do", intake.whatTheyDo);
  add("Who they serve", intake.whoTheyServe);
  add("How long trading", intake.howLongTrading);
  add("Current revenue", intake.currentRevenue);
  add("Revenue goal", intake.revenueGoal);
  add("Biggest challenge", intake.biggestChallenge);
  add("What they've tried", intake.whatTheyTried);
  add("What's working", intake.whatIsWorking);
  add("What's not working", intake.whatIsNot);
  add("Current tools", intake.currentTools);
  add("Team situation", intake.teamSituation);
  add("Content platforms", intake.contentPlatforms);
  add("Biggest personal block", intake.biggestPersonalBlock);
  add("Goal 1", intake.goalOne);
  add("Goal 2", intake.goalTwo);
  add("Goal 3", intake.goalThree);
  add("Success in 6 months", intake.successIn6Months);
  add("Personal story", intake.personalStory);
  add("Client feedback", intake.clientsFeedback);
  add("Industry belief", intake.industryBelief);
  add("Daily routine", intake.dailyRoutine);
  add("Most proud of", intake.mostProudOf);

  const system = `You are a strategic business coach synthesising a new client's onboarding intake form into a rich business context profile. This profile will be used in every AI-generated brief and summary for this client: it must be comprehensive, accurate, and immediately useful.

Write in third person (e.g. "Sarah runs a..."). Cover:
1. BUSINESS OVERVIEW: what they do, who for, how they make money, where they are now
2. STRATEGIC CONTEXT: goals, challenges, market position
3. FOUNDER PROFILE: working style, strengths, fears, motivations
4. CONTENT & MARKETING: channels, voice, what's working, what's not
5. PROGRAMME FOCUS: what they want from this engagement, what success looks like

Be specific and factual. Don't pad. Australian English. 400–600 words.`;

  const user = `Generate a business context profile for ${profile.founderName} (${profile.businessName}).

Intake responses:
${fields.join("\n")}`;

  const content = await generate(system, user);

  // Store as an AgentDraft for Jess to review and approve
  await prisma.agentDraft.create({
    data: {
      clientProfileId,
      type: "onboarding-context",
      title: `Onboarding Context: ${profile.founderName}`,
      status: "pending",
      context: "Generated from onboarding intake form submission",
      content,
    },
  });

  // Mark step 1 complete
  const existingStep = await prisma.onboardingStep.findFirst({
    where: { clientProfileId, step: 1 },
    select: { id: true },
  });

  if (existingStep) {
    await prisma.onboardingStep.update({
      where: { id: existingStep.id },
      data: { status: "complete", completedAt: new Date() },
    });
  } else {
    await prisma.onboardingStep.create({
      data: { clientProfileId, step: 1, status: "complete", completedAt: new Date() },
    });
  }

  return content;
}
