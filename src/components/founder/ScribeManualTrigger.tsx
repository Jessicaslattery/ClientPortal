"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runScribeManual } from "@/app/(founder)/clients/[id]/scribe-actions";

type Props = { clientId: string };

export function ScribeManualTrigger({ clientId }: Props) {
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<{ success: boolean; draftId?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const res = await runScribeManual(clientId, transcript);
      setResult(res);
      if (res.success) {
        setTranscript("");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-[#E8E2D9] p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Scribe Agent</h3>
          <p className="text-xs text-[#5C5550] mt-1">
            Paste a transcript to generate a session summary, staged tasks, and goal updates.
          </p>
        </div>
        <button
          onClick={() => {
            setOpen((o) => !o);
            setResult(null);
          }}
          className="shrink-0 rounded-2xl px-4 py-1.5 border border-[#E8E2D9] text-[#5C5550] text-[10px] tracking-[0.12em] uppercase hover:border-[#C8B89A] hover:text-[#C8B89A] transition-colors"
        >
          {open ? "Close" : "Run Scribe"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the full call transcript here…"
            rows={10}
            className="w-full rounded-2xl border border-[#E8E2D9] bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#C8B89A] focus:outline-none focus:border-[#C8B89A] resize-y leading-6"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#8C8277]">
              {transcript.length > 0 && `${transcript.split(/\s+/).filter(Boolean).length} words`}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isPending || !transcript.trim()}
              className="rounded-2xl px-5 py-2 bg-[#1A1714] text-[#F5F0EA] text-[10px] tracking-[0.12em] uppercase hover:bg-[#2D2723] transition-colors disabled:opacity-40"
            >
              {isPending ? "Processing…" : "Process Transcript"}
            </button>
          </div>

          {result?.success && (
            <p className="text-xs text-[#2D6A4F] flex items-center gap-1.5">
              <span>✓</span> Session summary generated.{" "}
              <Link href="/agent-workspace" className="underline hover:text-[#4A9A6F]">
                Review in Agent Workspace →
              </Link>
            </p>
          )}
          {result?.error && (
            <p className="text-xs text-[#9B2335]">Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
