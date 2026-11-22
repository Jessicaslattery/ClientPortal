"use client";

import { useTransition, useState } from "react";
import { saveCallNotesAction } from "@/app/(founder)/clients/[id]/call-actions";
import { useRouter } from "next/navigation";

type Props = {
  clientId: string;
  callId: string;
  call: {
    transcript: string | null;
    summaryContent: string | null;
    keyDecisions: string | null;
    nextSteps: string | null;
    completedAt: string | null;
    notesUrl: string | null;
  };
};

export function CallNotesForm({ clientId, callId, call }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveCallNotesAction(clientId, callId, fd);
      setSaved(true);
      setTimeout(() => router.push(`/clients/${clientId}`), 800);
    });
  }

  const today = new Date().toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-[#EDEBE6] p-5 space-y-5">
        <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Session notes</h2>

        <div>
          <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">
            Summary <span className="text-[#b0a89e] normal-case tracking-normal">(what we covered)</span>
          </label>
          <textarea
            name="summaryContent"
            rows={4}
            defaultValue={call.summaryContent ?? ""}
            placeholder="What was the focus of this session?"
            className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">Key decisions</label>
          <textarea
            name="keyDecisions"
            rows={3}
            defaultValue={call.keyDecisions ?? ""}
            placeholder="What was decided or agreed on?"
            className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">Next steps</label>
          <textarea
            name="nextSteps"
            rows={3}
            defaultValue={call.nextSteps ?? ""}
            placeholder="What needs to happen before the next call?"
            className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#EDEBE6] p-5 space-y-4">
        <div>
          <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">
            Tasks to create <span className="text-[#b0a89e] normal-case tracking-normal">(one per line: added to open tasks)</span>
          </label>
          <textarea
            name="tasks"
            rows={4}
            placeholder={"Update landing page copy\nSend follow-up email to leads\nBook next session"}
            className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none font-mono"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#EDEBE6] p-5 space-y-4">
        <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Gemini Notes</h2>
        <div>
          <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">
            Link <span className="text-[#b0a89e] normal-case tracking-normal">(paste Gemini Notes URL)</span>
          </label>
          <input
            name="notesUrl"
            type="url"
            defaultValue={call.notesUrl ?? ""}
            placeholder="https://gemini.google.com/notes/..."
            className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#EDEBE6] p-5 space-y-4">
        <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Transcript (optional)</h2>
        <textarea
          name="transcript"
          rows={8}
          defaultValue={call.transcript ?? ""}
          placeholder="Paste the full transcript here…"
          className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none font-mono text-xs"
        />
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">Call completed at</label>
          <input
            name="completedAt"
            type="datetime-local"
            defaultValue={call.completedAt ? call.completedAt.slice(0, 16) : today}
            className="rounded-xl border border-[#EDEBE6] text-[#1A1917] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={pending || saved}
          className="ml-auto px-6 py-3 rounded-2xl bg-[#1A1917] text-white text-xs tracking-[0.1em] hover:bg-[#2C2520] transition-colors disabled:opacity-40"
        >
          {saved ? "Saved ✓" : pending ? "Saving…" : "Save notes"}
        </button>
      </div>
    </form>
  );
}
