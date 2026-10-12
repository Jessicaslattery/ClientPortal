"use server";

import { requireAuth } from "@/lib/auth";
import { generateFounderBriefing } from "@/lib/agents/executive-assistant";
import { generateTrendDigest } from "@/lib/agents/trend-agent";
import { revalidatePath } from "next/cache";

export async function generateBriefingAction(): Promise<{ error?: string }> {
  await requireAuth("founder");
  try {
    await generateFounderBriefing("monday");
    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate briefing." };
  }
}

export async function generateTrendDigestAction(): Promise<{ error?: string }> {
  await requireAuth("founder");
  try {
    await generateTrendDigest();
    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate trend digest." };
  }
}
