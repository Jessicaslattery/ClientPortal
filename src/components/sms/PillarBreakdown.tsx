"use client";

const PILLAR_LABELS: Record<string, string> = {
  training: "Training",
  nutrition: "Nutrition",
  results: "Results",
  personal_brand: "Personal Brand",
};

const PILLAR_COLORS: Record<string, string> = {
  training: "#1A1917",
  nutrition: "#6d675e",
  results: "#2D6A4F",
  personal_brand: "#9B2335",
};

type PillarRow = { pillar: string; count: number; reach: number; engRate: number };

export function PillarBreakdown({ pillarData }: { pillarData: PillarRow[] }) {
  const maxReach = Math.max(...pillarData.map((p) => p.reach), 1);

  return (
    <section className="space-y-4">
      <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Pillar performance</p>
      <div className="space-y-3">
        {pillarData.map((p) => (
          <div key={p.pillar} className="flex items-center gap-4">
            <span className="text-xs text-[#1A1917] w-28 shrink-0">{PILLAR_LABELS[p.pillar]}</span>
            <div className="flex-1 h-1.5 bg-[#E6E2D9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(p.reach / maxReach) * 100}%`,
                  background: PILLAR_COLORS[p.pillar] ?? "#1A1917",
                }}
              />
            </div>
            <span className="text-xs text-[#6d675e] w-20 text-right shrink-0">
              {p.count} posts · {p.engRate}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
