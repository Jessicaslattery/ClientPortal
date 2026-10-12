"use server";

import { requireAuth } from "@/lib/auth";
import {
  generatePreCallBrief,
  generateSessionSummary,
  generateSocialPlan,
  generateProgressReport,
} from "@/lib/agent";
import { generatePrepBrief } from "@/lib/agents/prep-agent";
import { generateContentPlan } from "@/lib/agents/content-agent";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type GenerateState = { error: string; success: string };

export async function generatePrepBriefAction(
  clientProfileId: string,
  _prev: GenerateState,
  _formData: FormData
): Promise<GenerateState> {
  await requireAuth("founder");
  try {
    await generatePrepBrief(clientProfileId);
    revalidatePath("/agent-workspace");
    revalidatePath(`/clients/${clientProfileId}`);
    return { error: "", success: "Prep brief generated and sent to Agent Workspace." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed.", success: "" };
  }
}

export async function generatePreCallBriefAction(
  clientProfileId: string,
  _prev: GenerateState,
  _formData: FormData
): Promise<GenerateState> {
  await requireAuth("founder");
  try {
    await generatePreCallBrief(clientProfileId);
    revalidatePath("/agent-workspace");
    revalidatePath("/dashboard");
    return { error: "", success: "Pre-call brief generated and sent to Agent Workspace." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed.", success: "" };
  }
}

export async function generateSocialPlanAction(
  clientProfileId: string,
  _prev: GenerateState,
  _formData: FormData
): Promise<GenerateState> {
  await requireAuth("founder");
  try {
    await generateSocialPlan(clientProfileId);
    revalidatePath("/agent-workspace");
    revalidatePath("/dashboard");
    return { error: "", success: "Social plan generated and sent to Agent Workspace." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed.", success: "" };
  }
}

export async function generateProgressReportAction(
  clientProfileId: string,
  _prev: GenerateState,
  _formData: FormData
): Promise<GenerateState> {
  await requireAuth("founder");
  try {
    await generateProgressReport(clientProfileId);
    revalidatePath("/agent-workspace");
    revalidatePath("/dashboard");
    return { error: "", success: "Progress report generated and sent to Agent Workspace." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed.", success: "" };
  }
}

export async function generateContentPlanAction(
  clientProfileId: string,
  _prev: GenerateState,
  _formData: FormData
): Promise<GenerateState> {
  await requireAuth("founder");
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await generateContentPlan(clientProfileId, month);
    revalidatePath("/agent-workspace");
    revalidatePath(`/clients/${clientProfileId}`);
    return { error: "", success: "Content plan generated and sent to Agent Workspace." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed.", success: "" };
  }
}

// ─── Week Controls ────────────────────────────────────────────────────────────

export async function advanceWeekAction(clientProfileId: string) {
  await requireAuth("founder");

  const profile = await prisma.clientProfile.findUniqueOrThrow({ where: { id: clientProfileId } });

  let newMonth = profile.currentMonth;
  let newWeek = profile.currentWeek;

  if (newWeek < 4) {
    newWeek += 1;
  } else {
    newWeek = 1;
    newMonth += 1;
  }

  await prisma.clientProfile.update({
    where: { id: clientProfileId },
    data: { currentWeek: newWeek, currentMonth: newMonth },
  });

  // Snapshot all active goals for this month
  const goals = await prisma.goal.findMany({ where: { clientProfileId, status: "active" } });
  const monthKey = `M${newMonth}W${newWeek}`;
  for (const goal of goals) {
    await prisma.goalSnapshot.create({
      data: {
        goalId: goal.id,
        clientProfileId,
        month: monthKey,
        progressAtSnapshot: goal.progressPercent,
      },
    });
  }

  revalidatePath(`/clients/${clientProfileId}`);
}

export async function setPhaseAction(clientProfileId: string, formData: FormData) {
  await requireAuth("founder");

  const startDateStr = formData.get("startDate") as string;
  if (!startDateStr) return;

  const startDate = new Date(startDateStr);
  const now = new Date();
  const daysSinceStart = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalWeeks = Math.floor(daysSinceStart / 7);
  const currentMonth = Math.floor(totalWeeks / 4) + 1;
  const currentWeek = (totalWeeks % 4) + 1;

  await prisma.clientProfile.update({
    where: { id: clientProfileId },
    data: { startDate, currentMonth, currentWeek },
  });

  revalidatePath(`/clients/${clientProfileId}`);
}

export async function generateSessionSummaryAction(
  clientProfileId: string,
  _prev: GenerateState,
  formData: FormData
): Promise<GenerateState> {
  await requireAuth("founder");
  const callId = formData.get("callId") as string;
  const transcript = formData.get("transcript") as string;
  if (!callId) {
    return { error: "Please select a call.", success: "" };
  }
  if (!transcript?.trim()) {
    return { error: "Transcript or notes are required.", success: "" };
  }
  try {
    await generateSessionSummary(clientProfileId, callId, transcript);
    revalidatePath("/agent-workspace");
    revalidatePath(`/clients/${clientProfileId}`);
    return { error: "", success: "Session summary generated and sent to Agent Workspace." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed.", success: "" };
  }
}
