/**
 * Granola MCP sync orchestrator.
 *
 * Pulls today's meetings from Granola, matches them to clients,
 * creates Call records, runs session summary generation, and logs results.
 */

"use server";

import { prisma } from "@/lib/db";
import { granolaListMeetings, granolaGetTranscript } from "@/lib/granola-mcp-client";
import { runScribeAgent } from "@/lib/agents/scribe-agent";
import type { SyncResult } from "@/lib/granola";

// ─── Client matching ─────────────────────────────────────────────────────────

async function matchToClient(
  title: string,
  participantEmails: string[]
): Promise<string | null> {
  const clients = await prisma.clientProfile.findMany({
    select: { id: true, founderName: true, businessName: true, email: true },
  });

  const titleLower = title.toLowerCase();

  for (const client of clients) {
    // Priority a: client name appears in meeting title
    const namesToCheck = [
      client.founderName.toLowerCase(),
      client.businessName.toLowerCase(),
    ];
    if (namesToCheck.some((n) => n.length > 2 && titleLower.includes(n))) {
      return client.id;
    }

    // Priority b: client email matches a participant
    if (
      participantEmails.some(
        (e) => e.toLowerCase() === client.email.toLowerCase()
      )
    ) {
      return client.id;
    }
  }

  return null;
}

// ─── Main sync ────────────────────────────────────────────────────────────────

export async function syncGranolaMCP(): Promise<SyncResult> {
  const errors: string[] = [];
  let transcriptsSaved = 0;
  let unmatched = 0;

  // Fetch this week's meetings and filter for today
  const meetings = await granolaListMeetings("this_week");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysMeetings = meetings.filter((m) => {
    const meetingDate = new Date(m.start_time ?? m.created_at);
    return meetingDate >= todayStart && meetingDate <= todayEnd;
  });

  for (const meeting of todaysMeetings) {
    try {
      // Skip if already saved
      const existing = await prisma.granolaTranscript.findUnique({
        where: { granolaId: meeting.id },
      });
      if (existing) continue;

      // Also skip if already in unmatched and resolved
      const existingUnmatched = await prisma.unmatchedTranscript.findUnique({
        where: { granolaId: meeting.id },
      });
      if (existingUnmatched?.resolved) continue;

      // Fetch full transcript
      const transcript = await granolaGetTranscript(meeting.id);
      const meetingDate = new Date(meeting.start_time ?? meeting.created_at);
      const participantEmails = (meeting.participants ?? [])
        .map((p) => p.email ?? "")
        .filter(Boolean);

      // Attempt client match
      const clientProfileId = await matchToClient(meeting.title, participantEmails);

      if (clientProfileId) {
        // Create or reuse a Call record for this meeting
        let call = await prisma.call.findFirst({
          where: { clientProfileId, granolaUrl: meeting.id },
        });

        if (!call) {
          call = await prisma.call.create({
            data: {
              clientProfileId,
              title: meeting.title,
              scheduledAt: meetingDate,
              completedAt: meetingDate,
              granolaUrl: meeting.id,
              transcript,
            },
          });
        }

        // Save Granola transcript record
        await prisma.granolaTranscript.create({
          data: {
            granolaId: meeting.id,
            clientProfileId,
            date: meetingDate,
            title: meeting.title,
            transcript,
            summary: meeting.summary ?? null,
            processed: false,
          },
        });

        // Run Scribe Agent (writes SessionSummary + AgentDraft + staged tasks/goals)
        await runScribeAgent(clientProfileId, transcript, call.id);

        transcriptsSaved++;
      } else {
        // Save to unmatched queue (upsert in case it was already there unresolved)
        await prisma.unmatchedTranscript.upsert({
          where: { granolaId: meeting.id },
          update: {},
          create: {
            granolaId: meeting.id,
            date: meetingDate,
            title: meeting.title,
            transcript,
            resolved: false,
          },
        });
        unmatched++;
      }
    } catch (err) {
      errors.push(
        `${meeting.title}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const result: SyncResult = {
    meetingsFound: todaysMeetings.length,
    transcriptsSaved,
    unmatched,
    errors: errors.length > 0 ? errors.join("; ") : null,
  };

  await prisma.granolaSyncLog.create({ data: result });

  return result;
}

// ─── Assign unmatched and process ─────────────────────────────────────────────

export async function assignAndProcessUnmatched(
  unmatchedId: string,
  clientProfileId: string
): Promise<void> {
  const unmatched = await prisma.unmatchedTranscript.findUniqueOrThrow({
    where: { id: unmatchedId },
  });

  // Create Call record
  const call = await prisma.call.create({
    data: {
      clientProfileId,
      title: unmatched.title,
      scheduledAt: unmatched.date,
      completedAt: unmatched.date,
      granolaUrl: unmatched.granolaId,
      transcript: unmatched.transcript,
    },
  });

  // Save to GranolaTranscript
  await prisma.granolaTranscript.create({
    data: {
      granolaId: unmatched.granolaId,
      clientProfileId,
      date: unmatched.date,
      title: unmatched.title,
      transcript: unmatched.transcript,
      processed: false,
    },
  });

  // Run Scribe Agent
  await runScribeAgent(clientProfileId, unmatched.transcript, call.id);

  // Mark resolved
  await prisma.unmatchedTranscript.update({
    where: { id: unmatchedId },
    data: { resolved: true, assignedClientId: clientProfileId },
  });
}
