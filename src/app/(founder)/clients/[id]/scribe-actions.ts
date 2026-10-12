"use server";

import { requireAuth } from "@/lib/auth";
import { runScribeAgent } from "@/lib/agents/scribe-agent";
import { revalidatePath } from "next/cache";

export async function runScribeManual(
  clientId: string,
  transcript: string
): Promise<{ success: boolean; draftId?: string; error?: string }> {
  await requireAuth("founder");

  if (!transcript.trim()) {
    return { success: false, error: "Transcript cannot be empty." };
  }

  try {
    const draftId = await runScribeAgent(clientId, transcript);
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/agent-workspace");
    return { success: true, draftId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error.",
    };
  }
}
