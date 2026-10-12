"use client";

type Week = {
  weekLabel: string;
  revenue: number | null;
  energy: number | null;
  ratio: number | null;
};

function Sparkline({ values, color = "#C8B89A" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const W = 280;
  const H = 48;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * H}`)
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1)) * W} cy={H - (v / max) * H} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

function buildInsight(weeks: Week[]): string {
  const filled = weeks.filter((w) => w.energy != null && w.revenue != null);
  if (filled.length < 3) return "";

  const highEnergy = filled.filter((w) => (w.energy ?? 0) >= 7);
  const lowEnergy  = filled.filter((w) => (w.energy ?? 0) < 7);

  if (highEnergy.length === 0 || lowEnergy.length === 0) return "";

  const avgHigh = highEnergy.reduce((s, w) => s + (w.revenue ?? 0), 0) / highEnergy.length;
  const avgLow  = lowEnergy.reduce((s,  w) => s + (w.revenue ?? 0), 0) / lowEnergy.length;

  const energyThreshold = Math.round(
    (highEnergy.reduce((s, w) => s + (w.energy ?? 0), 0) / highEnergy.length)
  );

  if (avgHigh > avgLow * 1.1) {
    return `Your highest revenue weeks correlate with energy scores of ${energyThreshold} and above · protect that energy.`;
  }
  return `Revenue stays consistent regardless of energy score · strong operational systems at work.`;
}

export function EnergyDollarChart({ weeks }: { weeks: Week[] }) {
  const ratios = weeks.map((w) => w.ratio ?? 0);
  const current = weeks[weeks.length - 1];
  const insight = buildInsight(weeks);

  return (
    <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">Energy Per Dollar</p>
        {current?.ratio != null && (
          <div className="text-right">
            <span className="font-display text-2xl font-thin text-[#1A1714]">
              ${current.ratio.toFixed(0)}
            </span>
            <span className="text-[10px] text-[#8C8277] ml-1">revenue / energy pt</span>
          </div>
        )}
      </div>

      {insight && (
        <p className="text-xs text-[#5C5550] italic">{insight}</p>
      )}

      {ratios.some((r) => r > 0) ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277]">Revenue per energy point · 8 weeks</p>
          </div>
          <Sparkline values={ratios} color="#C8B89A" />
          <div className="flex justify-between mt-1">
            {weeks.map((w) => (
              <span key={w.weekLabel} className="text-[8px] text-[#8C8277]">{w.weekLabel}</span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#8C8277] italic">
          Complete your weekly scorecard with revenue and energy scores to see this trend.
        </p>
      )}
    </div>
  );
}
