"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ── Executive Assistant ───────────────────────────────────────────────────────
export async function runExecBriefingAction(): Promise<{ error?: string; success?: string }> {
  await requireAuth("founder");
  try {
    const { generateFounderBriefing } = await import("@/lib/agents/executive-assistant");
    await generateFounderBriefing("monday");
    revalidatePath("/agents");
    revalidatePath("/dashboard");
    return { success: "Briefing generated." };
  } catch (e) {
    return { error: String(e) };
  }
}

// ── Granola Sync ──────────────────────────────────────────────────────────────
export async function runGranolaSyncAction(): Promise<{ error?: string; success?: string }> {
  await requireAuth("founder");
  try {
    const { syncGranolaMCP } = await import("@/lib/granola-sync");
    const result = await syncGranolaMCP();
    revalidatePath("/agents");
    revalidatePath("/granola");
    return { success: `Synced. ${result.transcriptsSaved} saved, ${result.unmatched} unmatched.` };
  } catch (e) {
    return { error: String(e) };
  }
}

// ── Pulse nudge (per client) ──────────────────────────────────────────────────
export async function runPulseNudgeAction(
  clientId: string,
  type: "checkin_nudge" | "friday_progress"
): Promise<{ error?: string; success?: string }> {
  await requireAuth("founder");
  try {
    const { generatePulseMessage } = await import("@/lib/agents/pulse-agent");
    await generatePulseMessage(clientId, type);
    revalidatePath("/agents");
    revalidatePath("/agent-workspace");
    return { success: "Pulse message drafted and queued for review." };
  } catch (e) {
    return { error: String(e) };
  }
}

// ── Progress report (per client) ─────────────────────────────────────────────
export async function runProgressReportAction(
  clientId: string
): Promise<{ error?: string; success?: string }> {
  await requireAuth("founder");
  try {
    const { generateProgressReport } = await import("@/lib/agents/progress-agent");
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await generateProgressReport(clientId, month);
    revalidatePath("/agents");
    revalidatePath("/agent-workspace");
    return { success: "Progress report drafted and queued for review." };
  } catch (e) {
    return { error: String(e) };
  }
}

// ── Prep brief (per client) ───────────────────────────────────────────────────
export async function runPrepBriefAction(
  clientId: string
): Promise<{ error?: string; success?: string }> {
  await requireAuth("founder");
  try {
    const { generatePrepBrief } = await import("@/lib/agents/prep-agent");
    await generatePrepBrief(clientId);
    revalidatePath("/agents");
    revalidatePath("/agent-workspace");
    return { success: "Prep brief drafted." };
  } catch (e) {
    return { error: String(e) };
  }
}

// ── Content plan (per client) ─────────────────────────────────────────────────
export async function runContentPlanAction(
  clientId: string
): Promise<{ error?: string; success?: string }> {
  await requireAuth("founder");
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  try {
    const { generateContentPlan } = await import("@/lib/agents/content-agent");
    await generateContentPlan(clientId, month);
    revalidatePath("/agents");
    revalidatePath("/agent-workspace");
    return { success: "Content plan drafted and queued for review." };
  } catch (e) {
    return { error: String(e) };
  }
}
