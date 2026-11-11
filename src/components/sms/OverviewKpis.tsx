"use client";

type Props = {
  totalReach: number;
  avgEngRate: string;
  followers: number;
  planCompletion: number;
  postedCount: number;
  totalCount: number;
};

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function OverviewKpis({ totalReach, avgEngRate, followers, planCompletion, postedCount, totalCount }: Props) {
  const tiles = [
    { label: "Total reach", value: fmt(totalReach), sub: "Nov so far" },
    { label: "Avg engagement", value: `${avgEngRate}%`, sub: "posted content" },
    { label: "Followers", value: fmt(followers), sub: "as of today" },
    { label: "Plan completion", value: `${planCompletion}%`, sub: `${postedCount} / ${totalCount} posts` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#D9D3C6]">
      {tiles.map((t) => (
        <div key={t.label} className="bg-white px-5 py-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#6d675e]">{t.label}</p>
          <p className="mt-2 text-3xl font-[200] text-[#1A1917]" style={{ fontFamily: "var(--font-jakarta)" }}>
            {t.value}
          </p>
          <p className="mt-1 text-xs text-[#6d675e]">{t.sub}</p>
        </div>
      ))}
    </div>
  );
}
