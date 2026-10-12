"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWeekStart } from "@/lib/healthScore";
import { revalidatePath } from "next/cache";

type State = { error?: string; success?: string };

// ── Weekly scorecard ─────────────────────────────────────────────────
export async function submitScorecardAction(_prev: State, formData: FormData): Promise<State> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "No profile found." };

  const weekStartRaw = formData.get("weekStart") as string | null;
  const weekStart = weekStartRaw ? new Date(weekStartRaw) : getWeekStart();

  const str = (k: string) => (formData.get(k) as string)?.trim() || null;
  const num = (k: string) => parseInt(formData.get(k) as string) || null;
  const flt = (k: string) => parseFloat(formData.get(k) as string) || null;

  const data = {
    revenue:           flt("revenue"),
    leads:             num("leads"),
    callsBooked:       num("callsBooked"),
    callsConverted:    num("callsConverted"),
    contentPieces:     num("contentPieces"),
    hoursWorked:       flt("hoursWorked"),
    energyScore:       num("energyScore"),
    contentEnquiries:  num("contentEnquiries"),
    currentClients:    num("currentClients"),
    cancellations:     num("cancellations"),
    avgClientValue:    flt("avgClientValue"),
    followerGrowth:    num("followerGrowth"),
    bestPerformingPost: str("bestPerformingPost"),
    biggestWin:        str("biggestWin"),
    biggestBlock:      str("biggestBlock"),
  };

  await prisma.weeklyScorecard.upsert({
    where: { clientProfileId_weekStart: { clientProfileId: session.clientProfileId, weekStart } },
    update: data,
    create: { clientProfileId: session.clientProfileId, weekStart, ...data },
  });

  revalidatePath("/health");
  return { success: "Scorecard saved." };
}

// ── Targets ──────────────────────────────────────────────────────────
export async function updateTargetsAction(_prev: State, formData: FormData): Promise<State> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "No profile found." };

  const data = {
    revenueTarget:        parseFloat(formData.get("revenueTarget") as string) || 5000,
    leadsTarget:          parseInt(formData.get("leadsTarget") as string) || 5,
    callsBookedTarget:    parseInt(formData.get("callsBookedTarget") as string) || 3,
    callsConvertedTarget: parseInt(formData.get("callsConvertedTarget") as string) || 1,
    contentTarget:        parseInt(formData.get("contentTarget") as string) || 5,
    hoursTarget:          parseFloat(formData.get("hoursTarget") as string) || 40,
    energyTarget:         parseInt(formData.get("energyTarget") as string) || 7,
    monthlyRevenueTarget: parseFloat(formData.get("monthlyRevenueTarget") as string) || 20000,
    updatedAt:            new Date(),
  };

  await prisma.scorecardTargets.upsert({
    where: { clientProfileId: session.clientProfileId },
    update: data,
    create: { clientProfileId: session.clientProfileId, ...data },
  });

  revalidatePath("/health");
  return { success: "Targets updated." };
}

// ── Expenses ─────────────────────────────────────────────────────────
export async function addExpenseAction(_prev: State, formData: FormData): Promise<State> {
  const session = await requireAuth("client");
  if (!session.clientProfileId) return { error: "No profile found." };

  const name   = (formData.get("name") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);

  if (!name || !amount) return { error: "Name and amount required." };

  await prisma.monthlyExpense.create({
    data: { clientProfileId: session.clientProfileId, name, amount },
  });

  revalidatePath("/health");
  return { success: "Expense added." };
}

export async function deleteExpenseAction(id: string): Promise<void> {
  await requireAuth("client");
  await prisma.monthlyExpense.delete({ where: { id } });
  revalidatePath("/health");
}
