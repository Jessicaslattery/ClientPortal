"use client";

import { useState } from "react";

type Scorecard = {
  weekStart: string;
  revenue: number | null;
  leads: number | null;
  callsBooked: number | null;
  callsConverted: number | null;
  avgClientValue: number | null;
  currentClients: number | null;
  cancellations: number | null;
  contentPieces: number | null;
  contentEnquiries: number | null;
  followerGrowth: number | null;
  bestPerformingPost: string | null;
  hoursWorked: number | null;
  energyScore: number | null;
  biggestWin: string | null;
  biggestBlock: string | null;
};

type Client = {
  id: string;
  name: string;
  business: string;
  scorecards: Scorecard[];
};

const METRICS: {
  key: keyof Scorecard;
  label: string;
  type: "number" | "text";
  prefix?: string;
  suffix?: string;
  good?: "up" | "down" | "neutral";
}[] = [
  { key: "revenue", label: "Total revenue", type: "number", prefix: "$", good: "up" },
  { key: "leads", label: "New leads / enquiries", type: "number", good: "up" },
  { key: "callsBooked", label: "Sales calls booked", type: "number", good: "up" },
  { key: "callsConverted", label: "Sales calls converted", type: "number", good: "up" },
  { key: "avgClientValue", label: "Avg new client value", type: "number", prefix: "$", good: "up" },
  { key: "currentClients", label: "Current clients", type: "number", good: "up" },
  { key: "cancellations", label: "Cancellations / pauses", type: "number", good: "down" },
  { key: "contentPieces", label: "Posts published", type: "number", good: "up" },
  { key: "contentEnquiries", label: "DMs / enquiries", type: "number", good: "up" },
  { key: "followerGrowth", label: "Follower growth", type: "number", good: "up" },
  { key: "bestPerformingPost", label: "Best performing post", type: "text" },
  { key: "hoursWorked", label: "Hours worked", type: "number", good: "neutral" },
  { key: "energyScore", label: "Energy score (1–10)", type: "number", suffix: "/10", good: "up" },
  { key: "biggestWin", label: "Biggest win", type: "text" },
  { key: "biggestBlock", label: "Biggest block", type: "text" },
];

function fmtNum(v: number | null | undefined, prefix = "", suffix = "") {
  if (v === null || v === undefined) return "—";
  return `${prefix}${Number(v).toLocaleString("en-AU", { maximumFractionDigits: 2 })}${suffix}`;
}

function delta(
  curr: number | null,
  prev: number | null,
  good: "up" | "down" | "neutral" | undefined
): { text: string; cls: string } | null {
  if (curr === null || prev === null || good === undefined || good === "neutral") return null;
  const diff = curr - prev;
  if (diff === 0) return null;
  const pct = prev !== 0 ? Math.abs((diff / prev) * 100).toFixed(1) + "%" : Math.abs(diff).toLocaleString();
  const arrow = diff > 0 ? "↑" : "↓";
  const isGood = good === "up" ? diff > 0 : diff < 0;
  return {
    text: `${arrow} ${pct}`,
    cls: isGood ? "text-[#2D6A4F] bg-[#EDFAF2]" : "text-[#9B2335] bg-[#FBEAEA]",
  };
}

function latestRevenue(client: Client) {
  if (!client.scorecards.length) return -Infinity;
  const v = client.scorecards[client.scorecards.length - 1].revenue;
  return v ?? -Infinity;
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const tension = 0.35;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function RevenueChart({ scorecards }: { scorecards: Scorecard[] }) {
  const W = 620, H = 200;
  const padL = 56, padR = 16, padT = 16, padB = 36;

  const pts = scorecards
    .map((s, i) => ({ i, v: s.revenue }))
    .filter((p): p is { i: number; v: number } => p.v !== null);

  if (pts.length < 2) {
    return (
      <p className="text-xs text-[#8C8277] py-8 text-center">
        Not enough data to plot a trend yet
      </p>
    );
  }

  const n = scorecards.length;
  const maxVal = Math.max(...pts.map((p) => p.v));
  const yMax = maxVal * 1.12;

  const toX = (i: number) => padL + (i / Math.max(n - 1, 1)) * (W - padL - padR);
  const toY = (v: number) => padT + (1 - v / yMax) * (H - padT - padB);
  const baseline = toY(0);

  const svgPts = pts.map((p) => ({ x: toX(p.i), y: toY(p.v) }));
  const linePath = smoothPath(svgPts);

  // Close fill path back along baseline
  const fillPath =
    linePath +
    ` L ${svgPts[svgPts.length - 1].x} ${baseline} L ${svgPts[0].x} ${baseline} Z`;

  // Y-axis ticks: 0, 25%, 50%, 75%, max — rounded to nearest $500
  const rawTicks = [0, 0.25, 0.5, 0.75, 1].map((t) =>
    Math.round((t * maxVal) / 500) * 500
  );
  const yTicks = [...new Set(rawTicks)];

  const xEvery = Math.max(1, Math.ceil(n / 7));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1714" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1A1714" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Horizontal grid + Y labels */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={padL} x2={W - padR}
            y1={toY(v)} y2={toY(v)}
            stroke="#E8E2D9" strokeWidth={v === 0 ? 1.5 : 1}
          />
          <text x={padL - 8} y={toY(v) + 4} textAnchor="end" fontSize={10} fill="#8C8277">
            {v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
          </text>
        </g>
      ))}

      {/* Gradient fill */}
      <path d={fillPath} fill="url(#revFill)" />

      {/* Smooth line */}
      <path d={linePath} fill="none" stroke="#1A1714" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {svgPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#FAFAF8" stroke="#1A1714" strokeWidth={2} />
      ))}

      {/* X-axis labels */}
      {scorecards.map((s, i) => {
        if (i % xEvery !== 0 && i !== n - 1) return null;
        const d = new Date(s.weekStart);
        const label = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
        return (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="#8C8277">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function Overview({ clients }: { clients: Client[]; onSelect: (id: string) => void }) {
  const sorted = [...clients].sort((a, b) => latestRevenue(b) - latestRevenue(a));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((c) => {
        const cards = c.scorecards;
        const latest = cards[cards.length - 1] ?? null;
        const prev = cards[cards.length - 2] ?? null;
        const d = latest && prev ? delta(latest.revenue, prev.revenue, "up") : null;
        return (
          <div
            key={c.id}
            className="rounded-3xl border border-[#E8E2D9] bg-white px-5 py-4"
            style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.07)" }}
          >
            <p className="text-sm font-medium text-[#1A1714]">{c.name}</p>
            <p className="text-[11px] text-[#8C8277] mb-3">{c.business}</p>
            {latest ? (
              <>
                <p className="font-display text-2xl font-light text-[#1A1714]">
                  {fmtNum(latest.revenue, "$")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[11px] text-[#8C8277]">
                    Total revenue · {new Date(latest.weekStart).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })}
                  </p>
                  {d && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${d.cls}`}>
                      {d.text}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-[#8C8277]">No scorecards yet</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClientDetail({ client }: { client: Client }) {
  const cards = client.scorecards;
  if (!cards.length) {
    return (
      <div className="rounded-3xl border border-[#E8E2D9] bg-white px-6 py-12 text-center"
        style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.07)" }}>
        <p className="text-sm text-[#8C8277]">No weekly scorecards logged yet for {client.name}.</p>
      </div>
    );
  }

  const latest = cards[cards.length - 1];
  const prev = cards.length > 1 ? cards[cards.length - 2] : null;

  return (
    <div className="space-y-6">
      {/* Revenue chart */}
      <div className="rounded-3xl border border-[#E8E2D9] bg-white px-6 pt-5 pb-4"
        style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.07)" }}>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-1">
          {client.name} — Revenue trend
        </p>
        <p className="text-xs text-[#5C5550] mb-4">
          Latest: {new Date(latest.weekStart).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })}
          {prev ? ` · Previous: ${new Date(prev.weekStart).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })}` : ""}
        </p>
        <RevenueChart scorecards={cards} />
      </div>

      {/* Metrics table */}
      <div className="rounded-3xl border border-[#E8E2D9] bg-white overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.07)" }}>
        <div className="px-6 pt-5 pb-3">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">
            Every metric · week on week
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse" style={{ minWidth: 600 }}>
            <thead>
              <tr className="border-b border-[#E8E2D9]">
                <th className="sticky left-0 bg-white px-6 py-2.5 text-left text-[10px] uppercase tracking-[0.1em] text-[#8C8277] font-medium"
                  style={{ minWidth: 200 }}>
                  Metric
                </th>
                {cards.map((c) => (
                  <th key={c.weekStart}
                    className="px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.08em] text-[#8C8277] font-medium whitespace-nowrap"
                    style={{ minWidth: 140 }}>
                    {new Date(c.weekStart).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.key} className="border-b border-[#E8E2D9] last:border-0 hover:bg-[#F5F2ED]/50">
                  <td className="sticky left-0 bg-white px-6 py-3 text-[#5C5550] text-[11px]">
                    {m.label}
                  </td>
                  {cards.map((c, i) => {
                    const val = c[m.key] as number | string | null;
                    const prevVal = i > 0 ? (cards[i - 1][m.key] as number | null) : null;
                    const d = m.type === "number" && i > 0
                      ? delta(val as number | null, prevVal, m.good)
                      : null;
                    return (
                      <td key={c.weekStart} className="px-4 py-3 align-top">
                        {m.type === "text" ? (
                          <span className="text-[#1A1714] text-[11px] leading-relaxed">
                            {val ?? "—"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-[#1A1714]">
                              {fmtNum(val as number | null, m.prefix, m.suffix)}
                            </span>
                            {d && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${d.cls}`}>
                                {d.text}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ClientStatsBoard({ clients }: { clients: Client[] }) {
  const [selectedId, setSelectedId] = useState<string>("__ALL__");

  const sorted = [...clients].sort((a, b) => latestRevenue(b) - latestRevenue(a));
  const selectedClient = clients.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="text-sm px-4 py-2.5 rounded-2xl border border-[#E8E2D9] bg-white text-[#1A1714] focus:outline-none focus:ring-1 focus:ring-[#C8B89A]"
        >
          <option value="__ALL__">All clients — overview</option>
          {sorted.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedId === "__ALL__" ? (
        <Overview clients={clients} onSelect={setSelectedId} />
      ) : selectedClient ? (
        <ClientDetail client={selectedClient} />
      ) : null}
    </div>
  );
}
