import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are the Pivot Co. Prep Agent. Your role is to prepare Jess for every client call so she walks in with complete context and total strategic clarity.

Return plain text with these sections:

CLIENT SNAPSHOT
[Name, tier, programme month and week]
[Health score and trend]
[One sentence: what is the headline story for this client right now]

SINCE LAST CALL
[Tasks completed since last session]
[Tasks still open and overdue]
[Goal progress movements]
[Check-in summary: energy score trend and key themes]
[Any messages worth noting]

GRANOLA CONTEXT
[Key decisions from last 2 calls]
[Commitments the client made that are unresolved]
[Any recurring themes or patterns across calls]

THIS WEEK'S FOCUS
[The single most important thing to address on this call]
[3 to 5 suggested talking points in priority order]
[Any risks or sensitivities to be aware of]

QUICK NUMBERS
[Current revenue vs target]
[Any metric that has significantly moved since last call]

FORMAT: Clean, scannable, short headers. Written addressing Jess directly: 'Sarah has...' not 'The client has...'. Australian English. Maximum one page equivalent. Flag missing data clearly rather than guessing.`;

export async function generatePrepBrief(clientId: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    profile,
    recentCheckIns,
    openTasks,
    recentlyCompletedTasks,
    activeGoals,
    recentSessions,
    recentMessages,
    recentScorecard,
    scorecardTargets,
    granolaTranscripts,
  ] = await Promise.all([
    prisma.clientProfile.findUniqueOrThrow({
      where: { id: clientId },
      select: {
        founderName: true,
        businessName: true,
        tier: true,
        startDate: true,
        currentMonth: true,
        currentWeek: true,
        currentPhase: true,
        businessContext: true,
        personalityNotes: true,
        nextSessionFocus: true,
      },
    }),
    prisma.checkIn.findMany({
      where: { clientProfileId: clientId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.task.findMany({
      where: { clientProfileId: clientId, completed: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.task.findMany({
      where: {
        clientProfileId: clientId,
        completed: true,
        completedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { completedAt: "desc" },
      take: 8,
    }),
    prisma.goal.findMany({
      where: { clientProfileId: clientId, status: "active" },
      include: {
        progressNotes: { orderBy: { createdAt: "desc" }, take: 2 },
      },
    }),
    prisma.call.findMany({
      where: { clientProfileId: clientId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 2,
    }),
    prisma.message.findMany({
      where: { clientProfileId: clientId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { senderRole: true, content: true, createdAt: true },
    }),
    prisma.weeklyScorecard.findFirst({
      where: { clientProfileId: clientId },
      orderBy: { weekStart: "desc" },
    }),
    prisma.scorecardTargets.findUnique({ where: { clientProfileId: clientId } }),
    prisma.granolaTranscript.findMany({
      where: { clientProfileId: clientId },
      orderBy: { date: "desc" },
      take: 2,
      select: { date: true, title: true, summary: true, transcript: true },
    }),
  ]);

  const lines: string[] = [];

  // Client basics
  const monthsSinceStart = Math.floor(
    (Date.now() - new Date(profile.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  lines.push(`CLIENT: ${profile.founderName}`);
  lines.push(`BUSINESS: ${profile.businessName}`);
  lines.push(`TIER: ${profile.tier}`);
  lines.push(
    `PROGRAMME: Month ${profile.currentMonth}, Week ${profile.currentWeek} (${profile.currentPhase}): ${monthsSinceStart} months since start`
  );

  if (profile.nextSessionFocus) {
    lines.push(`\nPREVIOUSLY FLAGGED FOCUS: ${profile.nextSessionFocus}`);
  }

  if (profile.businessContext) {
    lines.push(`\nBUSINESS CONTEXT:\n${profile.businessContext}`);
  }

  if (profile.personalityNotes) {
    lines.push(`\nPERSONALITY NOTES:\n${profile.personalityNotes}`);
  }

  // Check-ins
  if (recentCheckIns.length > 0) {
    lines.push(`\nRECENT CHECK-INS:`);
    for (const c of recentCheckIns) {
      lines.push(`\nM${c.monthNumber}W${c.weekNumber}: Energy ${c.energyScore}/10:`);
      lines.push(`  Completed: ${c.completed}`);
      lines.push(`  Not completed: ${c.notCompleted}`);
      lines.push(`  Stuck: ${c.stuck}`);
      lines.push(`  Shifted: ${c.shifted}`);
      if (c.energyNote) lines.push(`  Energy note: ${c.energyNote}`);
      if (c.bottleneck) lines.push(`  Bottleneck: ${c.bottleneck}`);
    }
  } else {
    lines.push(`\nRECENT CHECK-INS: None on record`);
  }

  // Tasks
  const overdueTasks = openTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date()
  );
  if (recentlyCompletedTasks.length > 0) {
    lines.push(
      `\nTASKS COMPLETED RECENTLY: ${recentlyCompletedTasks.map((t) => t.title).join(", ")}`
    );
  } else {
    lines.push(`\nTASKS COMPLETED RECENTLY: None recorded`);
  }
  if (openTasks.length > 0) {
    lines.push(`\nOPEN TASKS (${openTasks.length} total):`);
    for (const t of openTasks.slice(0, 8)) {
      const overdue = t.dueDate && new Date(t.dueDate) < new Date() ? " [OVERDUE]" : "";
      lines.push(`  • [${t.priority}] ${t.title}${overdue}`);
    }
  }
  if (overdueTasks.length > 0) {
    lines.push(`\nOVERDUE COUNT: ${overdueTasks.length} tasks past due date`);
  }

  // Goals
  if (activeGoals.length > 0) {
    lines.push(`\nACTIVE GOALS:`);
    for (const g of activeGoals) {
      lines.push(`  • ${g.title}: ${g.progressPercent}%`);
      if (g.baselineNote) lines.push(`    Baseline: ${g.baselineNote}`);
      if (g.targetNote) lines.push(`    Target: ${g.targetNote}`);
      for (const note of g.progressNotes) {
        lines.push(`    Progress note: ${note.note} (${note.progress}%)`);
      }
    }
  } else {
    lines.push(`\nACTIVE GOALS: None recorded`);
  }

  // Past sessions
  if (recentSessions.length > 0) {
    lines.push(`\nLAST ${recentSessions.length} SESSION(S):`);
    for (const s of recentSessions) {
      lines.push(
        `\n${s.title}: ${new Date(s.completedAt!).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}:`
      );
      if (s.summaryContent) lines.push(`  Summary: ${s.summaryContent}`);
      if (s.keyDecisions) lines.push(`  Key decisions: ${s.keyDecisions}`);
      if (s.nextSteps) lines.push(`  Next steps committed: ${s.nextSteps}`);
    }
  } else {
    lines.push(`\nSESSION HISTORY: No completed sessions on record`);
  }

  // Granola transcripts
  if (granolaTranscripts.length > 0) {
    lines.push(`\nGRANOLA TRANSCRIPTS (last ${granolaTranscripts.length}):`);
    for (const g of granolaTranscripts) {
      lines.push(
        `\n${g.title}: ${new Date(g.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}:`
      );
      if (g.summary) {
        lines.push(`  Summary: ${g.summary}`);
      } else {
        // Truncate raw transcript if no summary
        lines.push(`  Transcript excerpt: ${g.transcript.slice(0, 500)}…`);
      }
    }
  } else {
    lines.push(`\nGRANOLA TRANSCRIPTS: No transcripts available`);
  }

  // Recent messages
  if (recentMessages.length > 0) {
    lines.push(`\nRECENT MESSAGES (last ${recentMessages.length}):`);
    for (const m of recentMessages) {
      const from = m.senderRole === "founder" ? "Jess" : profile.founderName;
      lines.push(
        `  [${new Date(m.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}: ${from}]: ${m.content.slice(0, 150)}`
      );
    }
  }

  // Scorecard / revenue
  if (recentScorecard) {
    lines.push(`\nLATEST WEEKLY SCORECARD (w/c ${new Date(recentScorecard.weekStart).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}):`);
    if (recentScorecard.revenue != null) {
      const target = scorecardTargets?.revenueTarget;
      lines.push(
        `  Revenue: $${recentScorecard.revenue.toLocaleString("en-AU")}${target ? ` vs $${target.toLocaleString("en-AU")} target` : ""}`
      );
    }
    if (recentScorecard.leads != null) lines.push(`  Leads: ${recentScorecard.leads}`);
    if (recentScorecard.callsBooked != null) lines.push(`  Calls booked: ${recentScorecard.callsBooked}`);
    if (recentScorecard.callsConverted != null) lines.push(`  Calls converted: ${recentScorecard.callsConverted}`);
    if (recentScorecard.contentPieces != null) lines.push(`  Content pieces: ${recentScorecard.contentPieces}`);
    if (recentScorecard.energyScore != null) lines.push(`  Energy: ${recentScorecard.energyScore}/10`);
  } else {
    lines.push(`\nWEEKLY SCORECARD: No data logged this week`);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Generate a pre-call brief using this data:\n\n${lines.join("\n")}` }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");

  const content = block.text;

  const draft = await prisma.agentDraft.create({
    data: {
      clientProfileId: clientId,
      type: "prep-brief",
      title: `Prep Brief: ${profile.founderName}, M${profile.currentMonth}W${profile.currentWeek}`,
      status: "pending",
      context: `Generated: ${new Date().toISOString()} | Check-ins: ${recentCheckIns.length} | Granola: ${granolaTranscripts.length} transcript(s)`,
      content,
    },
  });

  // Notify founder via an internal message (senderRole "agent", not shown to client)
  // We store this as a flag on the draft itself — the Agent Workspace surfaces it
  // The notification text is embedded in the draft title/context above

  return draft.id;
}
