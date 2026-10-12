"use client";

import { useActionState, useState } from "react";
import {
  generatePrepBriefAction,
  generatePreCallBriefAction,
  generateSocialPlanAction,
  generateProgressReportAction,
  generateSessionSummaryAction,
  generateContentPlanAction,
} from "@/app/(founder)/clients/[id]/generate/actions";
import Link from "next/link";

type Props = {
  clientProfileId: string;
  calls: { id: string; title: string; scheduledAt: Date; completedAt: Date | null }[];
};

const initialState = { error: "", success: "" };

function GenerateButton({
  action,
  label,
  description,
}: {
  action: (prev: typeof initialState, fd: FormData) => Promise<typeof initialState>;
  label: string;
  description: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-3xl border border-[#E8E2D9] p-4 hover:border-[#E8E2D9] transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#1A1714]">{label}</p>
            <p className="text-xs text-[#8C8277] mt-0.5">{description}</p>
            {state.success && (
              <p className="text-xs text-[#2D6A4F] mt-2 flex items-center gap-1.5">
                <span>✓</span> {state.success}{" "}
                <Link href="/agent-workspace" className="underline hover:text-[#8ab89a]">
                  Review →
                </Link>
              </p>
            )}
            {state.error && <p className="text-xs text-[#9B2335] mt-2">{state.error}</p>}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-2xl px-4 py-1.5 border border-[#E8E2D9] text-[#5C5550] text-[10px] tracking-[0.12em] uppercase hover:border-[#C8B89A] hover:text-[#C8B89A] transition-colors disabled:opacity-40"
          >
            {pending ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </form>
  );
}

function SessionSummaryForm({
  clientProfileId,
  calls,
}: {
  clientProfileId: string;
  calls: Props["calls"];
}) {
  const [selectedCallId, setSelectedCallId] = useState(
    calls.find((c) => c.completedAt)?.id ?? calls[0]?.id ?? ""
  );
  const [expanded, setExpanded] = useState(false);

  const boundAction = generateSessionSummaryAction.bind(null, clientProfileId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const completedCalls = calls.filter((c) => c.completedAt);
  if (completedCalls.length === 0) return null;

  return (
    <div className="rounded-3xl border border-[#E8E2D9] p-4 hover:border-[#E8E2D9] transition-colors">
      <button
        type="button"
        className="w-full flex items-start justify-between gap-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <p className="text-sm text-[#1A1714]">Session Summary</p>
          <p className="text-xs text-[#8C8277] mt-0.5">Paste transcript or notes from a completed call</p>
          {state.success && (
            <p className="text-xs text-[#2D6A4F] mt-2">
              ✓ {state.success}{" "}
              <Link href="/agent-workspace" className="underline">
                Review →
              </Link>
            </p>
          )}
          {state.error && <p className="text-xs text-[#9B2335] mt-2">{state.error}</p>}
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className={`text-[#8C8277] mt-1 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {expanded && (
        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="callId" value={selectedCallId} />
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
              Select call
            </label>
            <select
              value={selectedCallId}
              onChange={(e) => setSelectedCallId(e.target.value)}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A]"
            >
              {completedCalls.map((call) => (
                <option key={call.id} value={call.id}>
                  {call.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
              Transcript or notes
            </label>
            <textarea
              name="transcript"
              rows={6}
              required
              placeholder="Paste call transcript, Granola notes, or your own session notes here…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] resize-none leading-5"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-1.5 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-50"
          >
            {pending ? "Generating…" : "Generate summary"}
          </button>
        </form>
      )}
    </div>
  );
}

export function GenerateDraftPanel({ clientProfileId, calls }: Props) {
  const prepBriefAction = generatePrepBriefAction.bind(null, clientProfileId);
  const preCallAction = generatePreCallBriefAction.bind(null, clientProfileId);
  const socialAction = generateSocialPlanAction.bind(null, clientProfileId);
  const progressAction = generateProgressReportAction.bind(null, clientProfileId);
  const contentPlanAction = generateContentPlanAction.bind(null, clientProfileId);

  return (
    <div className="rounded-3xl border border-[#E8E2D9] p-5">
      <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">
        Generate with AI
      </h3>
      <div className="space-y-3">
        <GenerateButton
          action={prepBriefAction}
          label="Prep Brief"
          description="Full pre-call brief · check-ins, tasks, goals, Granola transcripts, scorecard"
        />
        <GenerateButton
          action={preCallAction}
          label="Pre-call Brief (legacy)"
          description="Reads latest check-in, client profile, and last call summary"
        />
        <SessionSummaryForm clientProfileId={clientProfileId} calls={calls} />
        <GenerateButton
          action={socialAction}
          label="Social Plan"
          description="Builds next month's content plan from profile and goals"
        />
        <GenerateButton
          action={progressAction}
          label="Progress Report"
          description="Synthesises check-ins, calls, and goal data into a full report"
        />
        <GenerateButton
          action={contentPlanAction}
          label="Content Plan"
          description="Generates personalised monthly posts from goals, wins, check-ins, and intake hooks"
        />
      </div>
      <p className="text-[10px] text-[#8C8277] mt-4">
        Drafts go to{" "}
        <Link href="/agent-workspace" className="text-[#5C5550] hover:text-[#C8B89A] transition-colors">
          Agent Workspace
        </Link>{" "}
        for review before reaching clients.
      </p>
    </div>
  );
}
