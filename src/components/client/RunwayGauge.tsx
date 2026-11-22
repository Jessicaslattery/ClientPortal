"use client";

function GaugeArc({ months, color }: { months: number; color: string }) {
  const r = 70;
  const cx = 90;
  const cy = 90;
  // Show up to 12 months max on gauge
  const pct = Math.min(months / 12, 1);
  const circumference = Math.PI * r;
  const offset = circumference - pct * circumference;

  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#EDEBE6" strokeWidth="8" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      {/* Markers at 2m and 4m */}
      {[2, 4].map((m) => {
        const angle = Math.PI - (m / 12) * Math.PI;
        const x = cx + r * Math.cos(angle);
        const y = cy - r * Math.sin(angle);
        return <circle key={m} cx={x} cy={y} r="2" fill="#b0a89e" />;
      })}
    </svg>
  );
}

export function RunwayGauge({
  months,
  mrr,
  monthlyExpenses,
}: {
  months: number;
  mrr: number;
  monthlyExpenses: number;
}) {
  const color = months >= 4 ? "#2D6A4F" : months >= 2 ? "#B7791F" : "#9B2335";
  const label = months >= 4 ? "Healthy" : months >= 2 ? "Monitor" : "Critical";
  const displayMonths = months === Infinity ? "∞" : months.toFixed(1);

  return (
    <div className="rounded-2xl border border-[#EDEBE6] bg-[#FFFFFF] p-6">
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#7a7268] mb-4">90-Day Runway</p>

      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <GaugeArc months={months === Infinity ? 12 : months} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-4xl font-[300]" style={{ color }}>{displayMonths}</span>
            <span className="text-[10px] uppercase mt-0.5" style={{ color }}>{label}</span>
          </div>
        </div>
        <p className="text-[10px] text-[#b0a89e] mt-1">months runway</p>

        {/* Scale markers */}
        <div className="flex items-center gap-2 text-[9px] text-[#b0a89e] mt-1">
          <span className="text-[#9B2335]">Red &lt;2</span>
          <span>·</span>
          <span className="text-[#B7791F]">Amber 2–4</span>
          <span>·</span>
          <span className="text-[#2D6A4F]">Green 4+</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#EDEBE6] space-y-1.5 text-xs text-[#7a7268]">
        <div className="flex justify-between">
          <span>Current MRR</span>
          <span className="text-[#1A1917]">${mrr.toLocaleString("en-AU")}</span>
        </div>
        <div className="flex justify-between">
          <span>Monthly expenses</span>
          <span className="text-[#1A1917]">${monthlyExpenses.toLocaleString("en-AU")}</span>
        </div>
        <div className="flex justify-between">
          <span>Monthly net</span>
          <span className={mrr - monthlyExpenses >= 0 ? "text-[#2D6A4F]" : "text-[#9B2335]"}>
            ${(mrr - monthlyExpenses).toLocaleString("en-AU")}
          </span>
        </div>
      </div>
    </div>
  );
}
