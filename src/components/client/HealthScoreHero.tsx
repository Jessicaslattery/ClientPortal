"use client";

import type { HealthBreakdown } from "@/lib/healthScore";

const COLOR = {
  green: { ring: "#2D6A4F", bg: "bg-[#2D6A4F]/10", text: "text-[#2D6A4F]", label: "Strong" },
  amber: { ring: "#B7791F", bg: "bg-[#B7791F]/10", text: "text-[#B7791F]", label: "Needs attention" },
  red:   { ring: "#9B2335", bg: "bg-[#9B2335]/10", text: "text-[#9B2335]", label: "At risk" },
};

function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * r; // half circle
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width="200" height="120" viewBox="0 0 200 120">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#E8E2D9"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function Bucket({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-lg font-light" style={{ color }}>{score}</div>
      <div className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">{label}</div>
    </div>
  );
}

export function HealthScoreHero({
  breakdown,
  insight,
}: {
  breakdown: HealthBreakdown;
  insight: string;
}) {
  const c = COLOR[breakdown.color];

  return (
    <div className={`rounded-3xl border border-[#E8E2D9] p-8 ${c.bg}`}>
      <div className="flex flex-col items-center gap-2 mb-6">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Founder Health Score</p>

        {/* Arc gauge */}
        <div className="relative">
          <ScoreArc score={breakdown.total} color={c.ring} />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className={`font-display text-5xl font-thin ${c.text}`}>{breakdown.total}</span>
            <span className={`text-xs tracking-[0.1em] uppercase mt-0.5 ${c.text}`}>{c.label}</span>
          </div>
        </div>

        {/* Breakdown buckets */}
        <div className="grid grid-cols-4 gap-6 mt-2">
          <Bucket label="Revenue" score={breakdown.revenue} color={c.ring} />
          <Bucket label="Energy"  score={breakdown.energy}  color={c.ring} />
          <Bucket label="Goals"   score={breakdown.goals}   color={c.ring} />
          <Bucket label="Pipeline" score={breakdown.pipeline} color={c.ring} />
        </div>
      </div>

      {/* AI insight */}
      {insight && (
        <div className="border-t border-[#E8E2D9] pt-4 mt-2">
          <p className="text-xs text-[#5C5550] italic leading-relaxed text-center max-w-lg mx-auto">
            {insight}
          </p>
        </div>
      )}
    </div>
  );
}
