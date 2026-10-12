"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type State = { error?: string; success?: boolean };

export async function addExpenseAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const name = (formData.get("name") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) || "Operations";
  const month = (formData.get("month") as string);
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || isNaN(amount) || !month) return { error: "Name, amount and month are required." };

  await prisma.founderExpense.create({ data: { name, amount, category, month, notes } });
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteExpenseAction(id: string): Promise<void> {
  await requireAuth("founder");
  await prisma.founderExpense.delete({ where: { id } });
  revalidatePath("/expenses");
}

export async function updateExpenseAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) || "Operations";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || isNaN(amount)) return { error: "Name and amount are required." };

  await prisma.founderExpense.update({ where: { id }, data: { name, amount, category, notes } });
  revalidatePath("/expenses");
  return { success: true };
}

// ─── Income (actual money received, e.g. Stripe payouts net of fees) ──────────

export async function addIncomeAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const name = (formData.get("name") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);
  const month = formData.get("month") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || isNaN(amount) || !month) return { error: "Name, amount and month are required." };

  await prisma.founderIncome.create({ data: { name, amount, month, notes } });
  revalidatePath("/expenses");
  return { success: true };
}

export async function updateIncomeAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || isNaN(amount)) return { error: "Name and amount are required." };

  await prisma.founderIncome.update({ where: { id }, data: { name, amount, notes } });
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteIncomeAction(id: string): Promise<void> {
  await requireAuth("founder");
  await prisma.founderIncome.delete({ where: { id } });
  revalidatePath("/expenses");
}
