"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { generateBriefingAction } from "@/app/(founder)/dashboard/actions";

type AgentOutput = {
  id: string;
  content: string;
  createdAt: string;
};

export function FounderBriefingPanel({ initial }: { initial: AgentOutput | null }) {
  const [output, setOutput] = useState<AgentOutput | null>(initial);
  const lastIdRef = useRef(initial?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/founder/briefing");
        if (!res.ok) return;
        const data: AgentOutput | null = await res.json();
        if (data && data.id !== lastIdRef.current) {
          lastIdRef.current = data.id;
          setOutput(data);
        }
      } catch {
        // silent
      }
    };

    const interval = setInterval(poll, 60_000);
    return () => clearInterval(interval);
  }, []);

  function handleGenerate() {
    setGenerateError(null);
    startTransition(async () => {
      const result = await generateBriefingAction();
      if (result.error) {
        setGenerateError(result.error);
      } else {
        // Poll immediately after generation
        try {
          const res = await fetch("/api/founder/briefing");
          if (res.ok) {
            const data: AgentOutput | null = await res.json();
            if (data) { lastIdRef.current = data.id; setOutput(data); }
          }
        } catch { /* silent */ }
      }
    });
  }

  if (!output) {
    return (
      <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] px-6 py-8 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-[#1A1714] font-medium mb-1">No briefing yet this week.</p>
          <p className="text-xs text-[#8C8277] leading-relaxed max-w-lg">
            Your briefing pulls together check-ins, upcoming calls, open tasks and revenue data into a single summary.
            Auto-generated every Monday and Friday — or generate one now.
          </p>
          {generateError && <p className="text-xs text-[#9B2335] mt-2">{generateError}</p>}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="shrink-0 px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-[#C8B89A] border border-[#C8B89A]/30 rounded-2xl hover:bg-[#C8B89A]/8 transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          {isPending ? "Generating…" : "Generate now"}
        </button>
      </div>
    );
  }

  const date = new Date(output.createdAt).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-3xl border border-[#E8E2D9] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Generated {date}</p>
      </div>
      <div className="px-6 py-5">
        <pre className="whitespace-pre-wrap font-sans text-sm text-[#1A1714] leading-relaxed">
          {output.content}
        </pre>
      </div>
    </div>
  );
}
