/**
 * Granola integration helpers.
 *
 * Meetings can arrive two ways:
 *   1. Manual paste — Jess copies the transcript from Granola and submits via UI.
 *   2. API sync — a Granola API token is stored in GRANOLA_API_TOKEN and the
 *      syncFromGranolaAPI() function polls the API for recent meetings.
 *
 * Both paths normalise to the same upsertTranscript() call which handles
 * client-matching and persistence.
 */

import { prisma } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────

export type GranolaMeetingInput = {
  granolaId: string;
  date: Date;
  title: string;
  transcript: string;
  summary?: string;
};

export type SyncResult = {
  meetingsFound: number;
  transcriptsSaved: number;
  unmatched: number;
  errors: string | null;
};

// ─── Client matching ─────────────────────────────────────────────────────────

/**
 * Attempt to match a meeting title/transcript to a ClientProfile.
 * Checks founder name, business name, and email (all case-insensitive).
 * Returns the clientProfileId if matched, or null.
 */
async function matchMeetingToClient(title: string, transcript: string): Promise<string | null> {
  const clients = await prisma.clientProfile.findMany({
    select: { id: true, founderName: true, businessName: true, email: true },
  });

  const haystack = `${title} ${transcript}`.toLowerCase();

  for (const client of clients) {
    const needles = [
      client.founderName.toLowerCase(),
      client.businessName.toLowerCase(),
      client.email.toLowerCase(),
    ];
    if (needles.some((n) => n.length > 2 && haystack.includes(n))) {
      return client.id;
    }
  }

  return null;
}

// ─── Core upsert ─────────────────────────────────────────────────────────────

/**
 * Upsert a single meeting. Returns "saved", "unmatched", or "duplicate".
 */
export async function upsertTranscript(
  input: GranolaMeetingInput,
  forceClientId?: string
): Promise<"saved" | "unmatched" | "duplicate"> {
  // Check if already exists
  const existing = await prisma.granolaTranscript.findUnique({
    where: { granolaId: input.granolaId },
  });
  if (existing) return "duplicate";

  const clientProfileId = forceClientId ?? (await matchMeetingToClient(input.title, input.transcript));

  if (clientProfileId) {
    await prisma.granolaTranscript.create({
      data: {
        granolaId: input.granolaId,
        clientProfileId,
        date: input.date,
        title: input.title,
        transcript: input.transcript,
        summary: input.summary ?? null,
        processed: false,
      },
    });
    return "saved";
  } else {
    // Save to unmatched for manual assignment
    await prisma.unmatchedTranscript.upsert({
      where: { granolaId: input.granolaId },
      update: {},
      create: {
        granolaId: input.granolaId,
        date: input.date,
        title: input.title,
        transcript: input.transcript,
        resolved: false,
      },
    });
    return "unmatched";
  }
}

// ─── Batch process ───────────────────────────────────────────────────────────

export async function processMeetingsBatch(meetings: GranolaMeetingInput[]): Promise<SyncResult> {
  let transcriptsSaved = 0;
  let unmatched = 0;
  const errorMessages: string[] = [];

  for (const meeting of meetings) {
    try {
      const result = await upsertTranscript(meeting);
      if (result === "saved") transcriptsSaved++;
      if (result === "unmatched") unmatched++;
    } catch (err) {
      errorMessages.push(`${meeting.title}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const result: SyncResult = {
    meetingsFound: meetings.length,
    transcriptsSaved,
    unmatched,
    errors: errorMessages.length > 0 ? errorMessages.join("; ") : null,
  };

  await prisma.granolaSyncLog.create({ data: result });

  return result;
}

// ─── Granola API sync (optional) ─────────────────────────────────────────────

/**
 * Sync from the Granola REST API using GRANOLA_API_TOKEN.
 * Returns null if no token is configured.
 */
export async function syncFromGranolaAPI(): Promise<SyncResult | null> {
  const token = process.env.GRANOLA_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://api.granola.ai/v1/meetings?limit=50", {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      await prisma.granolaSyncLog.create({
        data: {
          meetingsFound: 0,
          transcriptsSaved: 0,
          unmatched: 0,
          errors: `Granola API error: ${res.status} ${res.statusText}`,
        },
      });
      return { meetingsFound: 0, transcriptsSaved: 0, unmatched: 0, errors: `API error ${res.status}` };
    }

    const data = (await res.json()) as {
      meetings: Array<{
        id: string;
        title: string;
        created_at: string;
        transcript?: string;
        summary?: string;
      }>;
    };

    const meetings: GranolaMeetingInput[] = (data.meetings ?? []).map((m) => ({
      granolaId: m.id,
      date: new Date(m.created_at),
      title: m.title,
      transcript: m.transcript ?? "",
      summary: m.summary,
    }));

    return processMeetingsBatch(meetings);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await prisma.granolaSyncLog.create({
      data: { meetingsFound: 0, transcriptsSaved: 0, unmatched: 0, errors: errorMsg },
    });
    return { meetingsFound: 0, transcriptsSaved: 0, unmatched: 0, errors: errorMsg };
  }
}
