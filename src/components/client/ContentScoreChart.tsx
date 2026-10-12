"use client";

type Week = {
  weekLabel: string;
  posts: number | null;
  enquiries: number | null;
  ratio: number | null;
};

function Sparkline({ values, color = "#C8B89A" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const W = 280;
  const H = 48;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - (v / max) * H;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={(i / (values.length - 1)) * W}
          cy={H - (v / max) * H}
          r="2.5"
          fill={color}
        />
      ))}
    </svg>
  );
}

export function ContentScoreChart({ weeks }: { weeks: Week[] }) {
  const current = weeks[weeks.length - 1];
  const ratios = weeks.map((w) => w.ratio ?? 0);
  const avgRatio = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;

  return (
    <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-5">
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">Content → Conversation</p>

      {/* This week */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Posts this week", val: current?.posts ?? "-" },
          { label: "Enquiries from content", val: current?.enquiries ?? "-" },
          { label: "Ratio", val: current?.ratio != null ? current.ratio.toFixed(2) : "-" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#F2EDE4] p-3 text-center">
            <div className="font-display text-xl font-thin text-[#1A1714]">{s.val}</div>
            <div className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-[#8C8277] italic">
        {current?.posts && current?.enquiries
          ? `${current.posts} posts → ${current.enquiries} enquiries this week`
          : "Log your content and enquiries in the scorecard to see your ratio."}
      </div>

      {/* Sparkline */}
      {ratios.some((r) => r > 0) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277]">8-week trend</p>
            <span className="text-[10px] text-[#5C5550]">avg {avgRatio.toFixed(2)}</span>
          </div>
          <Sparkline values={ratios} color="#C8B89A" />
          <div className="flex justify-between mt-1">
            {weeks.map((w) => (
              <span key={w.weekLabel} className="text-[8px] text-[#8C8277]">{w.weekLabel}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
