import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

export type PulseMessageType = "checkin_nudge" | "friday_progress";

const SYSTEM_PROMPT = `You are the Pivot Co. Pulse Agent writing on behalf of Jess, founder of Pivot Co.

You will be given client data and a message type. Return VALID JSON ONLY: no preamble, no markdown:

{"message": "string"}

For checkin_nudge:
Under 3 sentences. Reference something specific from their last session or check-in. Warm and encouraging, never chasing. Gentle prompt to complete their check-in. Australian English.

For friday_progress:
3 to 4 sentences. Acknowledge something specific they did or progressed this week. One forward-looking encouragement tied to their goals. Personal, never generic. Australian English.

NEVER copy-paste between clients. Every message must feel written specifically for that person.`;

export async function generatePulseMessage(
  clientId: string,
  messageType: PulseMessageType
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [profile, lastCheckIn, lastCall, completedTasksThisWeek, recentGoalNotes, currentScorecard] =
    await Promise.all([
      prisma.clientProfile.findUniqueOrThrow({
        where: { id: clientId },
        select: {
          founderName: true,
          businessName: true,
          currentPhase: true,
          currentMonth: true,
          currentWeek: true,
          tier: true,
        },
      }),
      prisma.checkIn.findFirst({
        where: { clientProfileId: clientId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.call.findFirst({
        where: { clientProfileId: clientId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
      }),
      prisma.task.findMany({
        where: {
          clientProfileId: clientId,
          completed: true,
          completedAt: { gte: sevenDaysAgo },
        },
        select: { title: true },
      }),
      prisma.goalProgressNote.findMany({
        where: {
          goal: { clientProfileId: clientId },
          createdAt: { gte: sevenDaysAgo },
        },
        include: { goal: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.weeklyScorecard.findFirst({
        where: { clientProfileId: clientId },
        orderBy: { weekStart: "desc" },
      }),
    ]);

  const contextLines: string[] = [
    `CLIENT: ${profile.founderName}`,
    `BUSINESS: ${profile.businessName}`,
    `TIER: ${profile.tier}`,
    `PHASE: ${profile.currentPhase}: Month ${profile.currentMonth}, Week ${profile.currentWeek}`,
    `MESSAGE TYPE: ${messageType}`,
  ];

  if (lastCheckIn) {
    contextLines.push(
      `\nLAST CHECK-IN (M${lastCheckIn.monthNumber}W${lastCheckIn.weekNumber}, energy ${lastCheckIn.energyScore}/10):`,
      `Completed: ${lastCheckIn.completed}`,
      `Not completed: ${lastCheckIn.notCompleted}`,
      `Stuck: ${lastCheckIn.stuck}`,
      `Shifted: ${lastCheckIn.shifted}`
    );
    if (lastCheckIn.energyNote) contextLines.push(`Energy note: ${lastCheckIn.energyNote}`);
    if (lastCheckIn.bottleneck) contextLines.push(`Bottleneck: ${lastCheckIn.bottleneck}`);
  } else {
    contextLines.push("\nLAST CHECK-IN: None on record");
  }

  if (lastCall?.summaryContent) {
    contextLines.push(`\nLAST SESSION SUMMARY: ${lastCall.summaryContent}`);
    if (lastCall.keyDecisions) {
      contextLines.push(`Key decisions: ${lastCall.keyDecisions}`);
    }
  } else {
    contextLines.push("\nLAST SESSION: No summary on record");
  }

  if (completedTasksThisWeek.length > 0) {
    contextLines.push(
      `\nTASKS COMPLETED THIS WEEK: ${completedTasksThisWeek.map((t) => t.title).join(", ")}`
    );
  } else {
    contextLines.push("\nTASKS COMPLETED THIS WEEK: None recorded");
  }

  if (recentGoalNotes.length > 0) {
    contextLines.push("\nGOAL PROGRESS THIS WEEK:");
    for (const note of recentGoalNotes) {
      contextLines.push(`• ${note.goal.title}: ${note.note} (${note.progress}%)`);
    }
  }

  if (currentScorecard) {
    const parts: string[] = [];
    if (currentScorecard.energyScore != null) parts.push(`Energy ${currentScorecard.energyScore}/10`);
    if (currentScorecard.revenue != null) parts.push(`Revenue $${currentScorecard.revenue}`);
    if (currentScorecard.leads != null) parts.push(`Leads ${currentScorecard.leads}`);
    if (parts.length > 0) {
      contextLines.push(`\nWEEKLY SCORECARD: ${parts.join(", ")}`);
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: contextLines.join("\n") }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");

  let messageText: string;
  try {
    const parsed = JSON.parse(block.text) as { message: string };
    messageText = parsed.message;
  } catch {
    messageText = block.text.trim();
  }

  const typeLabel =
    messageType === "checkin_nudge" ? "Check-in Nudge" : "Friday Progress Message";
  const weekLabel = `M${profile.currentMonth}W${profile.currentWeek}`;

  const draft = await prisma.agentDraft.create({
    data: {
      clientProfileId: clientId,
      type: "pulse-message",
      title: `${typeLabel}: ${profile.founderName}, ${weekLabel}`,
      status: "pending",
      context: `Type: ${messageType} | Generated: ${now.toISOString()}`,
      content: messageText,
    },
  });

  await prisma.scheduledMessage.create({
    data: {
      clientProfileId: clientId,
      type: messageType,
      scheduledFor: now,
      agentDraftId: draft.id,
      sent: false,
    },
  });

  return draft.id;
}
