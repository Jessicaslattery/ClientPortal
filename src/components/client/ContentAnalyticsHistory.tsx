"use client";

import { FUNNEL_LABELS, POST_TYPE_LABELS } from "@/lib/contentPostOptions";

type AnalyticsWeek = {
  weekOf: string;
  platform: string;
  reach: number;
  engagementRate: number;
  followerGrowth: number;
};

type PostMetrics = {
  funnel: string;
  contentType: string;
  status: string;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  reach?: number | null;
};

function Sparkline({ values, color = "#C8B89A" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const W = 280;
  const H = 48;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1)) * W} cy={H - (v / max) * H} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

function engagementScore(p: PostMetrics) {
  return (p.likes ?? 0) + (p.comments ?? 0) * 2 + (p.shares ?? 0) * 3 + (p.saves ?? 0) * 3;
}

function BreakdownBars({ title, rows }: { title: string; rows: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  if (rows.every((r) => r.value === 0)) return null;
  return (
    <div>
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">{title}</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="text-xs text-[#5C5550] w-32 shrink-0 truncate">{r.label}</span>
            <div className="flex-1 h-2 rounded-full bg-[#F5F2ED] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color ?? "#C8B89A" }} />
            </div>
            <span className="text-xs text-[#1A1714] w-14 shrink-0 text-right">{r.value.toLocaleString("en-AU")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContentAnalyticsHistory({
  analyticsWeeks,
  allPosts,
}: {
  analyticsWeeks: AnalyticsWeek[];
  allPosts: PostMetrics[];
}) {
  const completed = allPosts.filter((p) => p.status === "complete");
  const withMetrics = completed.filter((p) => p.views != null || p.likes != null || p.reach != null);

  if (analyticsWeeks.length === 0 && withMetrics.length === 0) return null;

  const sortedWeeks = [...analyticsWeeks].sort((a, b) => a.weekOf.localeCompare(b.weekOf));
  const reachValues = sortedWeeks.map((w) => w.reach);
  const engagementValues = sortedWeeks.map((w) => w.engagementRate);
  const avgEngagement = engagementValues.length
    ? (engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length).toFixed(1)
    : null;

  const byFunnel = new Map<string, number>();
  const byType = new Map<string, number>();
  for (const p of withMetrics) {
    const score = engagementScore(p) + (p.views ?? 0) * 0.1 + (p.reach ?? 0) * 0.1;
    byFunnel.set(p.funnel, (byFunnel.get(p.funnel) ?? 0) + score);
    byType.set(p.contentType, (byType.get(p.contentType) ?? 0) + score);
  }
  const funnelRows = Array.from(byFunnel.entries())
    .map(([key, value]) => ({ label: FUNNEL_LABELS[key] ?? key, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
  const typeRows = Array.from(byType.entries())
    .map(([key, value]) => ({ label: POST_TYPE_LABELS[key] ?? key, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-3xl border border-[#E8E2D9] bg-white p-6 space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">Performance over time</p>
        <p className="text-xs text-[#8C8277] mt-0.5">{withMetrics.length} complete with stats logged · {sortedWeeks.length} weekly logs</p>
      </div>

      {sortedWeeks.length >= 2 && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277]">Reach trend</p>
            </div>
            <Sparkline values={reachValues} color="#C8B89A" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277]">Engagement rate</p>
              {avgEngagement && <span className="text-[10px] text-[#5C5550]">avg {avgEngagement}%</span>}
            </div>
            <Sparkline values={engagementValues} color="#9B7DB8" />
          </div>
        </div>
      )}

      {funnelRows.length > 0 && (
        <BreakdownBars
          title="Which funnel stage performs best"
          rows={funnelRows.map((r) => ({ ...r, color: "#C8B89A" }))}
        />
      )}
      {typeRows.length > 0 && (
        <BreakdownBars
          title="Which content type performs best"
          rows={typeRows.map((r) => ({ ...r, color: "#9B7DB8" }))}
        />
      )}
    </div>
  );
}
