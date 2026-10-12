"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { generateTrendDigestAction } from "@/app/(founder)/dashboard/actions";

type AgentOutput = {
  id: string;
  content: string;
  createdAt: string;
};

type TrendData = {
  weekOf: string;
  instagram: { topFormat: string; topHookStyle: string; whatToAvoid: string; trendToTest: string; pivotAngle: string };
  linkedin: { topFormat: string; topHookStyle: string; whatToAvoid: string; trendToTest: string; pivotAngle: string };
  tiktok: { topFormat: string; topHookStyle: string; whatToAvoid: string; trendToTest: string; pivotAngle: string };
  topInsightThisWeek: string;
  contentAgentFeed: string[];
};

const PLATFORM_LABELS: Record<keyof Omit<TrendData, "weekOf" | "topInsightThisWeek" | "contentAgentFeed">, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

export function TrendDigestPanel({ initial }: { initial: AgentOutput | null }) {
  const [output, setOutput] = useState<AgentOutput | null>(initial);
  const lastIdRef = useRef(initial?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/founder/trend-digest");
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
      const result = await generateTrendDigestAction();
      if (result.error) {
        setGenerateError(result.error);
      } else {
        try {
          const res = await fetch("/api/founder/trend-digest");
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
          <p className="text-sm text-[#1A1714] font-medium mb-1">No trend digest yet this week.</p>
          <p className="text-xs text-[#8C8277] leading-relaxed max-w-lg">
            Analyses what is working on Instagram, LinkedIn and TikTok and surfaces content angles relevant to your clients.
            Auto-generated every Monday — or run it now.
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

  let parsed: TrendData | null = null;
  try {
    parsed = JSON.parse(output.content) as TrendData;
  } catch {
    // fallback to raw display
  }

  const date = new Date(output.createdAt).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (!parsed) {
    return (
      <div className="rounded-3xl border border-[#E8E2D9] px-6 py-5">
        <p className="text-xs text-[#8C8277] mb-3">Generated {date}</p>
        <pre className="whitespace-pre-wrap font-sans text-sm text-[#1A1714]">{output.content}</pre>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E8E2D9] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Week of {parsed.weekOf} · Generated {date}</p>
      </div>

      {/* Top insight */}
      <div className="px-6 py-4 border-b border-[#E8E2D9] bg-[#F5F2ED]">
        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1">Top insight this week</p>
        <p className="text-sm text-[#1A1714]">{parsed.topInsightThisWeek}</p>
      </div>

      {/* Platform columns */}
      <div className="grid grid-cols-3 divide-x divide-[#E8E2D9]">
        {(["instagram", "linkedin", "tiktok"] as const).map((platform) => {
          const p = parsed![platform];
          return (
            <div key={platform} className="px-5 py-5 space-y-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] font-medium">
                {PLATFORM_LABELS[platform]}
              </p>
              <div>
                <p className="text-[9px] tracking-[0.1em] uppercase text-[#C8B89A] mb-0.5">Top format</p>
                <p className="text-xs text-[#1A1714]">{p.topFormat}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.1em] uppercase text-[#C8B89A] mb-0.5">Hook style</p>
                <p className="text-xs text-[#1A1714]">{p.topHookStyle}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.1em] uppercase text-[#C8B89A] mb-0.5">Trend to test</p>
                <p className="text-xs text-[#1A1714]">{p.trendToTest}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.1em] uppercase text-[#C8B89A] mb-0.5">Pivot Co. angle</p>
                <p className="text-xs text-[#5C5550] italic">{p.pivotAngle}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.1em] uppercase text-[#9B2335] mb-0.5">Avoid</p>
                <p className="text-xs text-[#5C5550]">{p.whatToAvoid}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content agent feed */}
      {parsed.contentAgentFeed?.length > 0 && (
        <div className="px-6 py-4 border-t border-[#E8E2D9]">
          <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Content agent feed</p>
          <div className="flex flex-wrap gap-2">
            {parsed.contentAgentFeed.map((item, i) => (
              <span key={i} className="text-[10px] text-[#5C5550] bg-[#F5F2ED] rounded-full px-3 py-1">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
