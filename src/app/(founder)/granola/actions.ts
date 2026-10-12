"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { syncFromGranolaAPI, upsertTranscript, processMeetingsBatch } from "@/lib/granola";
import { syncGranolaMCP, assignAndProcessUnmatched } from "@/lib/granola-sync";
import type { SyncResult } from "@/lib/granola";

// ─── MCP Sync ────────────────────────────────────────────────────────────────

export async function syncGranolaMCPAction(): Promise<SyncResult & { message: string }> {
  await requireAuth("founder");

  try {
    const result = await syncGranolaMCP();
    revalidatePath("/granola");
    revalidatePath("/dashboard");
    return {
      ...result,
      message: result.errors
        ? `Sync completed with errors. ${result.transcriptsSaved} saved, ${result.unmatched} unmatched.`
        : `Sync complete. ${result.transcriptsSaved} transcript${result.transcriptsSaved !== 1 ? "s" : ""} saved, ${result.unmatched} unmatched.`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await prisma.granolaSyncLog.create({
      data: { meetingsFound: 0, transcriptsSaved: 0, unmatched: 0, errors: errorMsg },
    });
    return { meetingsFound: 0, transcriptsSaved: 0, unmatched: 0, errors: errorMsg, message: errorMsg };
  }
}

// ─── Assign Unmatched + Process ───────────────────────────────────────────────

export async function assignAndProcessAction(unmatchedId: string, clientProfileId: string) {
  await requireAuth("founder");
  await assignAndProcessUnmatched(unmatchedId, clientProfileId);
  revalidatePath("/granola");
  revalidatePath("/dashboard");
  return { success: "Transcript assigned, Call created, and session summary queued." };
}

// ─── Legacy API Sync ─────────────────────────────────────────────────────────

export async function syncGranolaAction(): Promise<SyncResult & { message: string }> {
  await requireAuth("founder");

  const result = await syncFromGranolaAPI();

  if (!result) {
    // No API token — log it
    await prisma.granolaSyncLog.create({
      data: {
        meetingsFound: 0,
        transcriptsSaved: 0,
        unmatched: 0,
        errors: "No GRANOLA_API_TOKEN configured",
      },
    });
    return {
      meetingsFound: 0,
      transcriptsSaved: 0,
      unmatched: 0,
      errors: "No GRANOLA_API_TOKEN configured",
      message: "No Granola API token is configured. Use manual paste to add transcripts.",
    };
  }

  revalidatePath("/granola");
  revalidatePath("/dashboard");

  return {
    ...result,
    message: result.errors
      ? `Sync completed with errors. ${result.transcriptsSaved} saved, ${result.unmatched} unmatched.`
      : `Sync complete. ${result.transcriptsSaved} transcripts saved, ${result.unmatched} unmatched.`,
  };
}

// ─── Manual Paste ────────────────────────────────────────────────────────────

export async function pasteTranscriptAction(formData: FormData) {
  await requireAuth("founder");

  const title = (formData.get("title") as string)?.trim();
  const transcript = (formData.get("transcript") as string)?.trim();
  const dateStr = formData.get("date") as string;
  const clientProfileId = (formData.get("clientProfileId") as string) || undefined;
  const summary = (formData.get("summary") as string)?.trim() || undefined;

  if (!title || !transcript) {
    return { error: "Title and transcript are required." };
  }

  const date = dateStr ? new Date(dateStr) : new Date();
  const granolaId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const result = await upsertTranscript(
    { granolaId, date, title, transcript, summary },
    clientProfileId || undefined
  );

  revalidatePath("/granola");

  if (result === "saved") {
    return { success: `Transcript saved and matched to client.` };
  } else if (result === "unmatched") {
    return { success: `Transcript saved to unmatched queue. Assign a client manually.` };
  } else {
    return { error: "A transcript with this ID already exists." };
  }
}

// ─── Assign Unmatched ────────────────────────────────────────────────────────

export async function assignUnmatchedTranscriptAction(formData: FormData) {
  await requireAuth("founder");

  const id = formData.get("id") as string;
  const clientProfileId = formData.get("clientProfileId") as string;

  const unmatched = await prisma.unmatchedTranscript.findUniqueOrThrow({ where: { id } });

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

  await prisma.unmatchedTranscript.update({
    where: { id },
    data: { resolved: true, assignedClientId: clientProfileId },
  });

  revalidatePath("/granola");
  return { success: "Transcript assigned to client." };
}

// ─── Delete Unmatched ─────────────────────────────────────────────────────────

export async function deleteUnmatchedTranscriptAction(id: string) {
  await requireAuth("founder");
  await prisma.unmatchedTranscript.delete({ where: { id } });
  revalidatePath("/granola");
}

// ─── Get Sync Logs ────────────────────────────────────────────────────────────

export async function getSyncLogs() {
  await requireAuth("founder");
  return prisma.granolaSyncLog.findMany({ orderBy: { runAt: "desc" }, take: 10 });
}
