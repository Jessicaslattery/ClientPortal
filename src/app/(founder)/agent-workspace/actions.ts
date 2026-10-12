"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { SessionSummaryJSON } from "@/lib/agent";
import type { ScribeOutputJSON } from "@/lib/agents/scribe-agent";

export async function approveDraft(draftId: string) {
  const session = await requireAuth("founder");

  const draft = await prisma.agentDraft.findUniqueOrThrow({ where: { id: draftId } });

  // ── Session summary: parse JSON and apply downstream effects ──────────────
  if (draft.type === "session-summary") {
    let parsed: SessionSummaryJSON | null = null;
    try {
      parsed = JSON.parse(draft.content) as SessionSummaryJSON;
    } catch {
      // Malformed JSON — still approve, just skip automation
    }

    if (parsed) {
      const now = new Date();

      // 1. Create tasks from actionItems
      if (parsed.actionItems?.length) {
        await prisma.task.createMany({
          data: parsed.actionItems.map((item) => ({
            clientProfileId: draft.clientProfileId,
            title: item.name,
            category: item.category,
            owner: item.owner,
            assignedTo: item.owner === "Jess" ? "founder" : "client",
            source: "session-summary",
            priority: "medium",
          })),
        });
      }

      // 2. Update goal progress from goalUpdates
      if (parsed.goalUpdates?.length) {
        for (const update of parsed.goalUpdates) {
          // Find goal by title (case-insensitive partial match)
          const goal = await prisma.goal.findFirst({
            where: {
              clientProfileId: draft.clientProfileId,
              title: { contains: update.goalName },
            },
          });
          if (goal) {
            await prisma.goal.update({
              where: { id: goal.id },
              data: { progressPercent: Math.min(100, Math.max(0, update.newProgress)) },
            });
            await prisma.goalProgressNote.create({
              data: {
                goalId: goal.id,
                progress: update.newProgress,
                note: update.note,
              },
            });
          }
        }
      }

      // 3. Save nextSessionFocus to ClientProfile
      if (parsed.nextSessionFocus) {
        await prisma.clientProfile.update({
          where: { id: draft.clientProfileId },
          data: { nextSessionFocus: parsed.nextSessionFocus },
        });
      }

      // 4. Save summary to the Call record if linked
      if (draft.callId && parsed.sessionSummary) {
        await prisma.call.update({
          where: { id: draft.callId },
          data: {
            summaryContent: parsed.sessionSummary,
            keyDecisions: parsed.keyDecisions?.join("\n") ?? null,
            nextSteps: parsed.actionItems?.map((a) => a.name).join("\n") ?? null,
            summaryStatus: "complete",
            completedAt: now,
          },
        });
      }
    }
  }

  // ── Onboarding message: send as a real message from founder to client ────
  if (draft.type === "onboarding-message") {
    let parsed: { message: string; founderNote?: string } = { message: draft.content };
    try {
      parsed = JSON.parse(draft.content) as typeof parsed;
    } catch {
      // Use raw content if not JSON
    }

    await prisma.message.create({
      data: {
        clientProfileId: draft.clientProfileId,
        senderId: session.id,
        senderRole: "founder",
        content: parsed.message,
        read: false,
      },
    });

    // Mark the corresponding OnboardingStep as complete
    const stepMatch = draft.title.match(/Onboarding Step (\d)/);
    if (stepMatch) {
      const stepNum = parseInt(stepMatch[1]);
      await prisma.onboardingStep.updateMany({
        where: { clientProfileId: draft.clientProfileId, step: stepNum },
        data: { status: "complete", completedAt: new Date(), agentDraftId: draft.id },
      });
    }
  }

  // ── Progress report: create Deliverable and notify client ────────────────
  if (draft.type === "progress_report") {
    let parsed: { month?: string } | null = null;
    try {
      parsed = JSON.parse(draft.content) as { month?: string };
    } catch {
      // Malformed JSON — still approve, skip automation
    }

    const monthLabel = parsed?.month ?? "Monthly";

    await prisma.deliverable.create({
      data: {
        clientProfileId: draft.clientProfileId,
        title: `${monthLabel} Progress Report`,
        description: draft.content,
        phase: "ONGOING",
        deliveredAt: new Date(),
      },
    });

    await prisma.message.create({
      data: {
        clientProfileId: draft.clientProfileId,
        senderId: session.id,
        senderRole: "founder",
        content: `Your ${monthLabel} progress report is ready to view in your deliverables.`,
        read: false,
      },
    });
  }

  // ── Scribe Agent session summary ─────────────────────────────────────────
  if (draft.type === "session_summary") {
    let parsed: ScribeOutputJSON | null = null;
    try {
      parsed = JSON.parse(draft.content) as ScribeOutputJSON;
    } catch {
      // Malformed JSON — still approve, skip automation
    }

    // Retrieve linked SessionSummary id from context
    let sessionSummaryId: string | null = null;
    try {
      const ctx = JSON.parse(draft.context ?? "{}") as { sessionSummaryId?: string };
      sessionSummaryId = ctx.sessionSummaryId ?? null;
    } catch {
      // ignore
    }

    if (sessionSummaryId) {
      // 1. Mark SessionSummary as approved
      await prisma.sessionSummary.update({
        where: { id: sessionSummaryId },
        data: { status: "approved" },
      });
    }

    if (parsed) {
      // 2. Activate staged tasks
      await prisma.task.updateMany({
        where: { clientProfileId: draft.clientProfileId, source: `scribe-draft-${draftId}` },
        data: { source: "scribe" },
      });

      // 3. Apply goal progress updates (remove [DRAFT] prefix from notes + update percent)
      if (parsed.goalsToUpdate?.length) {
        for (const update of parsed.goalsToUpdate) {
          const goal = await prisma.goal.findFirst({
            where: { clientProfileId: draft.clientProfileId, id: update.goalId },
          });
          if (!goal) continue;

          const newProgress = Math.min(100, Math.max(0, goal.progressPercent + (update.progressDelta ?? 0)));
          await prisma.goal.update({
            where: { id: goal.id },
            data: { progressPercent: newProgress },
          });

          // Update the draft progress note to remove the [DRAFT] prefix
          await prisma.goalProgressNote.updateMany({
            where: {
              goalId: goal.id,
              note: { contains: "[Draft - pending approval]" },
            },
            data: {
              note: update.progressNote,
              progress: newProgress,
            },
          });
        }
      }

      // 4. Save summary to the Call record if linked
      if (draft.callId && parsed.summary) {
        await prisma.call.update({
          where: { id: draft.callId },
          data: {
            summaryContent: parsed.summary,
            keyDecisions: JSON.stringify(parsed.keyDecisions ?? []),
            nextSteps: JSON.stringify(parsed.commitments ?? []),
            summaryStatus: "complete",
            completedAt: new Date(),
          },
        });
      }
    }

    // 5. Notify client their session notes are ready
    const sessionSummary = sessionSummaryId
      ? await prisma.sessionSummary.findUnique({ where: { id: sessionSummaryId } })
      : null;
    const dateStr = sessionSummary
      ? new Date(sessionSummary.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

    await prisma.message.create({
      data: {
        clientProfileId: draft.clientProfileId,
        senderId: session.id,
        senderRole: "founder",
        content: `Your session notes from ${dateStr} are ready to view. Head to Session Notes in your portal to read through them.`,
        read: false,
      },
    });
  }

  // ── Pulse message: send as a real message from founder to client ─────────
  if (draft.type === "pulse-message") {
    await prisma.message.create({
      data: {
        clientProfileId: draft.clientProfileId,
        senderId: session.id,
        senderRole: "founder",
        content: draft.content,
        read: false,
      },
    });

    // Mark linked ScheduledMessage as sent
    await prisma.scheduledMessage.updateMany({
      where: { agentDraftId: draftId },
      data: { sent: true, sentAt: new Date() },
    });
  }

  // ── Content plan: approve all linked posts and notify client ────────────
  if (draft.type === "content_plan") {
    let month: string | null = null;
    try {
      const parsed = JSON.parse(draft.content) as { month?: string };
      month = parsed.month ?? null;
    } catch {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }

    if (month) {
      await prisma.contentPost.updateMany({
        where: { clientProfileId: draft.clientProfileId, month },
        data: { status: "approved" },
      });

      const founderUser = await prisma.user.findFirst({ where: { role: "founder" } });
      if (founderUser) {
        const [year, monthNum] = month.split("-");
        const monthLabel = new Date(parseInt(year), parseInt(monthNum) - 1, 1).toLocaleDateString("en-AU", {
          month: "long",
          year: "numeric",
        });
        await prisma.message.create({
          data: {
            clientProfileId: draft.clientProfileId,
            senderId: founderUser.id,
            senderRole: "founder",
            content: `Your ${monthLabel} content plan is ready! Head to your Content Calendar to view all your posts for the month.`,
            read: false,
          },
        });
      }

      revalidatePath("/content-calendar");
    }
  }

  // ── Prep brief: founder-only — just approve, no client message ──────────
  // (Approved brief is surfaced on client profile under "Call Prep")

  await prisma.agentDraft.update({
    where: { id: draftId },
    data: {
      status: "approved",
      approvedAt: new Date(),
    },
  });

  revalidatePath("/agent-workspace");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath("/session-notes");
  if (draft.clientProfileId) {
    revalidatePath(`/clients/${draft.clientProfileId}`);
  }
}

export async function rejectDraft(draftId: string) {
  await requireAuth("founder");

  await prisma.agentDraft.update({
    where: { id: draftId },
    data: {
      status: "rejected",
      rejectedAt: new Date(),
    },
  });

  revalidatePath("/agent-workspace");
}
