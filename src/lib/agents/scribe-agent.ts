"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScribeOutputJSON = {
  summary: string;
  keyDecisions: string[];
  commitments: string[];
  themes: string[];
  tasksToCreate: Array<{
    title: string;
    dueDate: string | null;
    priority: "high" | "medium" | "low";
  }>;
  goalsToUpdate: Array<{
    goalId: string;
    progressNote: string;
    progressDelta: number;
  }>;
  founderNotes: string;
};

const SYSTEM_PROMPT = `You are the Pivot Co. Scribe Agent. You process call transcripts and extract structured intelligence.

Return VALID JSON ONLY: no preamble, no markdown:

{
  "summary": "string: 3 to 5 sentence narrative summary of the session. Written in past tense. Addresses Jess directly where relevant.",
  "keyDecisions": ["string array: decisions made in the call"],
  "commitments": ["string array: specific things the client committed to doing"],
  "themes": ["string array: recurring patterns or topics that came up"],
  "tasksToCreate": [
    {
      "title": "string",
      "dueDate": "string: ISO date or null",
      "priority": "high | medium | low"
    }
  ],
  "goalsToUpdate": [
    {
      "goalId": "string: if identifiable from context",
      "progressNote": "string: what was discussed about this goal",
      "progressDelta": "number: estimated % progress change, or 0 if unclear"
    }
  ],
  "founderNotes": "string: anything Jess should privately know or watch for. Risks, emotional signals, things unsaid."
}

Australian English. Be specific. Never invent information not in the transcript.`;

// ─── Main agent function ──────────────────────────────────────────────────────

export async function runScribeAgent(
  clientId: string,
  transcript: string,
  callId?: string
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  // Pull client context
  const client = await prisma.clientProfile.findUniqueOrThrow({
    where: { id: clientId },
    include: {
      goals: { where: { status: "active" } },
      tasks: { where: { completed: false }, take: 10 },
    },
  });

  const goalContext =
    client.goals.length > 0
      ? `\nActive goals:\n${client.goals.map((g) => `• [ID: ${g.id}] ${g.title}: ${g.progressPercent}% progress`).join("\n")}`
      : "\nNo active goals on record.";

  const taskContext =
    client.tasks.length > 0
      ? `\nOpen tasks:\n${client.tasks.map((t) => `• [${t.priority}] ${t.title}`).join("\n")}`
      : "";

  const userPrompt = `Process the following call transcript for ${client.founderName} (${client.businessName}).

Phase: ${client.currentPhase}: Month ${client.currentMonth}, Week ${client.currentWeek}
${goalContext}${taskContext}

TRANSCRIPT:
${transcript}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected response from Claude.");

  // Parse and validate JSON
  let parsed: ScribeOutputJSON;
  try {
    parsed = JSON.parse(block.text) as ScribeOutputJSON;
  } catch {
    throw new Error(`Scribe Agent returned invalid JSON: ${block.text.slice(0, 200)}`);
  }

  const now = new Date();

  // Save SessionSummary record (draft until approved)
  const sessionSummary = await prisma.sessionSummary.create({
    data: {
      clientProfileId: clientId,
      callId: callId ?? null,
      date: now,
      status: "draft",
      summary: parsed.summary,
      keyDecisions: JSON.stringify(parsed.keyDecisions ?? []),
      commitments: JSON.stringify(parsed.commitments ?? []),
      themes: JSON.stringify(parsed.themes ?? []),
      founderNotes: parsed.founderNotes ?? null,
    },
  });

  // Save AgentDraft so it appears in the approval workspace
  const draft = await prisma.agentDraft.create({
    data: {
      clientProfileId: clientId,
      callId: callId ?? null,
      type: "session_summary",
      status: "pending",
      title: `Session Summary: ${client.founderName}, ${now.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`,
      content: block.text,
      context: JSON.stringify({ sessionSummaryId: sessionSummary.id }),
    },
  });

  // Link draft back to SessionSummary
  await prisma.sessionSummary.update({
    where: { id: sessionSummary.id },
    data: { agentDraftId: draft.id },
  });

  // Stage tasks as draft (activated on approval)
  if (parsed.tasksToCreate?.length) {
    await prisma.task.createMany({
      data: parsed.tasksToCreate.map((task) => ({
        clientProfileId: clientId,
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        source: `scribe-draft-${draft.id}`,
        assignedTo: "client",
        owner: "Client",
      })),
    });
  }

  // Stage goal progress notes as draft (applied on approval)
  if (parsed.goalsToUpdate?.length) {
    for (const update of parsed.goalsToUpdate) {
      const goal = await prisma.goal.findFirst({
        where: { clientProfileId: clientId, id: update.goalId },
      });
      if (!goal) continue;

      await prisma.goalProgressNote.create({
        data: {
          goalId: goal.id,
          note: `[DRAFT: pending approval] ${update.progressNote}`,
          progress: Math.min(100, Math.max(0, goal.progressPercent + (update.progressDelta ?? 0))),
        },
      });
    }
  }

  return draft.id;
}
