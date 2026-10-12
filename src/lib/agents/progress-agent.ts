import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are the Pivot Co. Progress Agent. You write monthly progress reports that feel personal, honest and motivating: not corporate.

Return VALID JSON ONLY: no preamble, no markdown:

{
  "month": "string: e.g. July 2026",
  "clientName": "string",
  "headline": "string: one sentence that captures the spirit of this client's month",
  "wins": ["string array: real specific wins from this month, minimum 3"],
  "goalProgress": [
    {
      "goalTitle": "string",
      "startProgress": "number: % at start of month",
      "endProgress": "number: % at end of month",
      "narrative": "string: 2 sentences on what happened with this goal"
    }
  ],
  "tasksCompleted": "number",
  "tasksPending": "number",
  "energyTrend": "string: one sentence on their energy score pattern this month",
  "biggestMoment": "string: the single most significant thing that happened this month",
  "nextMonthFocus": "string: one strategic priority for next month based on where they are",
  "messageFromJess": "string: 3 to 4 sentences, warm and direct, written as Jess. Acknowledge something real. End with one forward-looking statement.",
  "socialSuggestions": ["string array: 3 social post ideas Jess could create about her work this month based on client themes. Do not name the client."],
  "resourceSuggestions": ["string array: 2 to 3 resource topics to add to the library based on what came up this month"]
}

Australian English. Every word must be earned. No filler. If data is missing say so clearly rather than inventing.`;

export interface ProgressReportJSON {
  month: string;
  clientName: string;
  headline: string;
  wins: string[];
  goalProgress: {
    goalTitle: string;
    startProgress: number;
    endProgress: number;
    narrative: string;
  }[];
  tasksCompleted: number;
  tasksPending: number;
  energyTrend: string;
  biggestMoment: string;
  nextMonthFocus: string;
  messageFromJess: string;
  socialSuggestions: string[];
  resourceSuggestions: string[];
}

export async function generateProgressReport(
  clientId: string,
  month: string // YYYY-MM
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const [year, monthNum] = month.split("-").map(Number);
  const monthStart = new Date(year, monthNum - 1, 1);
  const monthEnd = new Date(year, monthNum, 1);

  const [
    profile,
    goals,
    snapshots,
    tasks,
    checkIns,
    calls,
    goalProgressNotes,
    scorecards,
  ] = await Promise.all([
    prisma.clientProfile.findUniqueOrThrow({
      where: { id: clientId },
      select: {
        founderName: true,
        businessName: true,
        currentPhase: true,
        currentMonth: true,
        tier: true,
      },
    }),
    prisma.goal.findMany({
      where: { clientProfileId: clientId, status: "active" },
      select: { id: true, title: true, progressPercent: true },
    }),
    prisma.goalSnapshot.findMany({
      where: {
        clientProfileId: clientId,
        month,
      },
      select: { goalId: true, progressAtSnapshot: true },
    }),
    prisma.task.findMany({
      where: { clientProfileId: clientId },
      select: {
        title: true,
        completed: true,
        completedAt: true,
        category: true,
      },
    }),
    prisma.checkIn.findMany({
      where: {
        clientProfileId: clientId,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.call.findMany({
      where: {
        clientProfileId: clientId,
        completedAt: { gte: monthStart, lt: monthEnd },
      },
      select: {
        title: true,
        summaryContent: true,
        keyDecisions: true,
        completedAt: true,
      },
      orderBy: { completedAt: "asc" },
    }),
    prisma.goalProgressNote.findMany({
      where: {
        goal: { clientProfileId: clientId },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      include: { goal: { select: { title: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.weeklyScorecard.findMany({
      where: {
        clientProfileId: clientId,
        weekStart: { gte: monthStart, lt: monthEnd },
      },
      orderBy: { weekStart: "asc" },
    }),
  ]);

  const snapshotMap = new Map(snapshots.map((s) => [s.goalId, s.progressAtSnapshot]));

  const tasksThisMonth = tasks.filter(
    (t) => t.completedAt && t.completedAt >= monthStart && t.completedAt < monthEnd
  );
  const pendingTasks = tasks.filter((t) => !t.completed);

  const contextLines: string[] = [
    `CLIENT: ${profile.founderName}`,
    `BUSINESS: ${profile.businessName}`,
    `TIER: ${profile.tier}`,
    `PHASE: ${profile.currentPhase}: Month ${profile.currentMonth}`,
    `REPORT MONTH: ${month}`,
    "",
  ];

  if (goals.length > 0) {
    contextLines.push("GOALS & PROGRESS:");
    for (const goal of goals) {
      const start = snapshotMap.get(goal.id) ?? null;
      const end = goal.progressPercent;
      contextLines.push(
        `• ${goal.title}: ${start !== null ? `${start}% → ${end}%` : `current ${end}% (no start snapshot)`}`
      );
    }
    contextLines.push("");
  } else {
    contextLines.push("GOALS: None on record\n");
  }

  if (goalProgressNotes.length > 0) {
    contextLines.push("GOAL PROGRESS NOTES THIS MONTH:");
    for (const note of goalProgressNotes) {
      contextLines.push(`• ${note.goal.title}: ${note.note} (${note.progress}%)`);
    }
    contextLines.push("");
  }

  contextLines.push(
    `TASKS COMPLETED THIS MONTH: ${tasksThisMonth.length}`,
    `TASKS PENDING: ${pendingTasks.length}`
  );
  if (tasksThisMonth.length > 0) {
    contextLines.push(
      `Completed: ${tasksThisMonth.map((t) => t.title).join(", ")}`
    );
  }
  contextLines.push("");

  if (checkIns.length > 0) {
    contextLines.push("CHECK-INS THIS MONTH:");
    for (const ci of checkIns) {
      contextLines.push(
        `M${ci.monthNumber}W${ci.weekNumber} (energy ${ci.energyScore}/10):`,
        `  Completed: ${ci.completed}`,
        `  Not completed: ${ci.notCompleted}`,
        `  Stuck: ${ci.stuck}`
      );
      if (ci.energyNote) contextLines.push(`  Energy note: ${ci.energyNote}`);
      if (ci.bottleneck) contextLines.push(`  Bottleneck: ${ci.bottleneck}`);
    }
    const scores = checkIns.map((c) => c.energyScore);
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    contextLines.push(`Average energy score: ${avg}/10`);
    contextLines.push("");
  } else {
    contextLines.push("CHECK-INS: None this month\n");
  }

  if (calls.length > 0) {
    contextLines.push("SESSION SUMMARIES THIS MONTH:");
    for (const call of calls) {
      contextLines.push(`• ${call.title}`);
      if (call.summaryContent) contextLines.push(`  Summary: ${call.summaryContent}`);
      if (call.keyDecisions) contextLines.push(`  Key decisions: ${call.keyDecisions}`);
    }
    contextLines.push("");
  } else {
    contextLines.push("SESSIONS: None completed this month\n");
  }

  if (scorecards.length > 0) {
    contextLines.push("WEEKLY SCORECARDS:");
    for (const sc of scorecards) {
      const parts: string[] = [];
      if (sc.energyScore != null) parts.push(`energy ${sc.energyScore}/10`);
      if (sc.revenue != null) parts.push(`revenue $${sc.revenue}`);
      if (sc.leads != null) parts.push(`leads ${sc.leads}`);
      if (sc.callsBooked != null) parts.push(`calls booked ${sc.callsBooked}`);
      if (sc.callsConverted != null) parts.push(`converted ${sc.callsConverted}`);
      if (sc.contentPieces != null) parts.push(`content ${sc.contentPieces} pieces`);
      contextLines.push(
        `• Week of ${sc.weekStart.toISOString().slice(0, 10)}: ${parts.join(", ") || "no data"}`
      );
    }
    contextLines.push("");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: contextLines.join("\n") }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");

  let parsed: ProgressReportJSON;
  try {
    parsed = JSON.parse(block.text) as ProgressReportJSON;
  } catch {
    throw new Error(`Claude returned invalid JSON: ${block.text.slice(0, 200)}`);
  }

  const monthLabel = new Date(year, monthNum - 1, 1).toLocaleString("en-AU", {
    month: "long",
    year: "numeric",
  });

  const draft = await prisma.agentDraft.create({
    data: {
      clientProfileId: clientId,
      type: "progress_report",
      title: `Progress Report: ${profile.founderName}, ${monthLabel}`,
      status: "pending",
      context: `Month: ${month} | Generated: ${new Date().toISOString()}`,
      content: JSON.stringify(parsed),
    },
  });

  // Save social and resource suggestions as FounderSuggestion records
  const suggestionData: {
    type: string;
    content: string;
    month: string;
    sourceClientId: string;
    agentDraftId: string;
  }[] = [];

  for (const s of parsed.socialSuggestions ?? []) {
    suggestionData.push({
      type: "social",
      content: s,
      month,
      sourceClientId: clientId,
      agentDraftId: draft.id,
    });
  }
  for (const s of parsed.resourceSuggestions ?? []) {
    suggestionData.push({
      type: "resource",
      content: s,
      month,
      sourceClientId: clientId,
      agentDraftId: draft.id,
    });
  }

  if (suggestionData.length > 0) {
    await prisma.founderSuggestion.createMany({ data: suggestionData });
  }

  return draft.id;
}
