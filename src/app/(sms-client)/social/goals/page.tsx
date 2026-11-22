"use client";

import { useState } from "react";

type Goal = {
  id: string;
  title: string;
  description: string;
  metric: string;
  baseline: string;
  target: string;
  current: string;
  progress: number;
  status: "on-track" | "at-risk" | "achieved" | "not-started";
  dueDate: string;
  milestones: { label: string; done: boolean }[];
  notes: string;
  pillar: string;
};

const INITIAL_GOALS: Goal[] = [
  {
    id: "1",
    title: "Post consistently for 90 days",
    description: "4 posts per week minimum, every week, without a burnout break.",
    metric: "Posting streak",
    baseline: "0 days consistent",
    target: "90 days straight",
    current: "34 days",
    progress: 38,
    status: "on-track",
    dueDate: "2027-02-14",
    pillar: "Consistency",
    milestones: [
      { label: "First 7 days", done: true },
      { label: "30 days", done: true },
      { label: "60 days", done: false },
      { label: "90 days", done: false },
    ],
    notes: "Batching on Tuesdays has been a game changer. Missed one week in November but got back on track the next day.",
  },
  {
    id: "2",
    title: "Grow to 5,000 followers",
    description: "Organic follower growth on Instagram through consistent, strategic content.",
    metric: "Instagram followers",
    baseline: "3,400",
    target: "5,000",
    current: "3,847",
    progress: 29,
    status: "on-track",
    dueDate: "2027-03-31",
    pillar: "Growth",
    milestones: [
      { label: "Hit 3,500", done: true },
      { label: "Hit 3,750", done: true },
      { label: "Hit 4,000", done: false },
      { label: "Hit 4,500", done: false },
      { label: "Hit 5,000", done: false },
    ],
    notes: "The reels about burnout in October spiked +180 followers in one week. Need more of those.",
  },
  {
    id: "3",
    title: "3 DM enquiries from content",
    description: "Clients who reach out via DM specifically mentioning a post or reel (not referrals).",
    metric: "DM enquiries from content",
    baseline: "0 / past 60 days",
    target: "3 DMs in 60 days",
    current: "1 DM",
    progress: 33,
    status: "at-risk",
    dueDate: "2027-01-15",
    pillar: "Conversion",
    milestones: [
      { label: "First content DM", done: true },
      { label: "Second content DM", done: false },
      { label: "Third content DM", done: false },
    ],
    notes: "First DM came after the 'I had to stop' reel. Need more direct offer mentions in the content. Currently too much value, not enough CTA.",
  },
  {
    id: "4",
    title: "Hit $15k/month revenue",
    description: "Increase monthly income from $8-10k to $15k through content-driven enquiries.",
    metric: "Monthly revenue",
    baseline: "$8,000-$10,000",
    target: "$15,000",
    current: "$10,500",
    progress: 46,
    status: "on-track",
    dueDate: "2027-05-31",
    pillar: "Revenue",
    milestones: [
      { label: "Break $10k consistently", done: true },
      { label: "Hit $12k in a month", done: false },
      { label: "Hit $14k in a month", done: false },
      { label: "Hit $15k consistently", done: false },
    ],
    notes: "October was $10,500, first time above $10k. November retainer renewal helped. December is slower but that's seasonal.",
  },
];

const STATUS_CONFIG = {
  "on-track":    { label: "On track",    color: "#2D6A4F", bg: "#E5F2EC" },
  "at-risk":     { label: "At risk",     color: "#9B4F2A", bg: "#F5EAE0" },
  "achieved":    { label: "Achieved",    color: "#2D5F8A", bg: "#E5EEF7" },
  "not-started": { label: "Not started", color: "#7B746B", bg: "#F5F1EB" },
};

const PILLAR_COLORS: Record<string, string> = {
  "Consistency": "#8C735A",
  "Growth":      "#2D6A4F",
  "Conversion":  "#9B4F2A",
  "Revenue":     "#2D5F8A",
};

function ProgressBar({ progress, status }: { progress: number; status: Goal["status"] }) {
  const color = status === "achieved" ? "#2D5F8A" : status === "at-risk" ? "#9B4F2A" : "#2D6A4F";
  return (
    <div className="w-full bg-[#EDEBE6] rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(progress, 100)}%`, background: color }}
      />
    </div>
  );
}

function ProgressRing({ progress, status, size = 80 }: { progress: number; status: Goal["status"]; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const color = status === "achieved" ? "#2D5F8A" : status === "at-risk" ? "#9B4F2A" : "#2D6A4F";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EDEBE6" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-[300] text-[#1A1917]">{progress}%</span>
    </div>
  );
}

function GoalCard({
  goal,
  onSelect,
  selected,
}: {
  goal: Goal;
  onSelect: (g: Goal) => void;
  selected: boolean;
}) {
  const sc = STATUS_CONFIG[goal.status];
  const pc = PILLAR_COLORS[goal.pillar] ?? "#7B746B";

  return (
    <button
      onClick={() => onSelect(goal)}
      className={`w-full text-left border rounded-2xl p-5 transition-all ${
        selected
          ? "border-[#1A1917] bg-white shadow-sm"
          : "border-[#EDEBE6] hover:border-[#CDCAC4] bg-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <ProgressRing progress={goal.progress} status={goal.status} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className="text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full font-[400]"
              style={{ color: pc, background: pc + "15" }}
            >
              {goal.pillar}
            </span>
            <span
              className="text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full"
              style={{ color: sc.color, background: sc.bg }}
            >
              {sc.label}
            </span>
          </div>
          <p className="text-sm font-[300] text-[#1A1917] mb-0.5">{goal.title}</p>
          <p className="text-xs text-[#7a7268] font-[300] leading-relaxed">{goal.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[10px] text-[#b0a89e]">{goal.current} of {goal.target}</p>
            <p className="text-[10px] text-[#b0a89e]">Due {new Date(goal.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
      </div>
      {/* Milestone dots */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#EDEBE6]">
        {goal.milestones.map((m, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${m.done ? "" : "border border-[#CDCAC4]"}`}
              style={m.done ? { background: PILLAR_COLORS[goal.pillar] ?? "#7B746B" } : {}}
            />
            {i < goal.milestones.length - 1 && (
              <div className="flex-1 h-px" style={{ background: m.done ? (PILLAR_COLORS[goal.pillar] ?? "#8C735A") + "40" : "#EDEBE6" }} />
            )}
          </div>
        ))}
        <p className="text-[9px] text-[#b0a89e] shrink-0">{goal.milestones.filter((m) => m.done).length}/{goal.milestones.length}</p>
      </div>
    </button>
  );
}

export default function GoalsPage() {
  const [goals] = useState<Goal[]>(INITIAL_GOALS);
  const [selected, setSelected] = useState<Goal>(INITIAL_GOALS[0]);

  const achieved = goals.filter((g) => g.status === "achieved").length;
  const onTrack = goals.filter((g) => g.status === "on-track").length;
  const atRisk = goals.filter((g) => g.status === "at-risk").length;
  const sc = STATUS_CONFIG[selected.status];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">November 2026</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">Goals</h1>
        <p className="mt-2 text-sm text-[#7a7268] font-[300] leading-relaxed max-w-xl">
          What you are working toward and how you are tracking. Updated by your strategist after each session.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "On track",  value: onTrack,  color: "#2D6A4F", bg: "#E5F2EC" },
          { label: "At risk",   value: atRisk,   color: "#9B4F2A", bg: "#F5EAE0" },
          { label: "Achieved",  value: achieved, color: "#2D5F8A", bg: "#E5EEF7" },
        ].map((s) => (
          <div key={s.label} className="border border-[#EDEBE6] rounded-xl p-4 text-center">
            <p className="text-2xl font-[200]" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] tracking-[0.14em] uppercase mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Two-col layout: list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        {/* Goal list */}
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              selected={selected.id === g.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Detail panel */}
        <div className="border border-[#EDEBE6] rounded-2xl overflow-hidden h-fit sticky top-6">
          <div className="px-5 py-4 border-b border-[#EDEBE6] bg-[#F5F3EF]">
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">Goal detail</p>
              <span
                className="text-[9px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full"
                style={{ color: sc.color, background: sc.bg }}
              >
                {sc.label}
              </span>
            </div>
            <p className="mt-1 text-base font-[300] text-[#1A1917]">{selected.title}</p>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Progress */}
            <div>
              <div className="flex items-end justify-between mb-2">
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">Progress</p>
                <p className="text-xl font-[200] text-[#1A1917]">{selected.progress}%</p>
              </div>
              <ProgressBar progress={selected.progress} status={selected.status} />
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { label: "Starting point", value: selected.baseline },
                  { label: "Now",            value: selected.current },
                  { label: "Target",         value: selected.target },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-[9px] tracking-[0.12em] uppercase text-[#b0a89e]">{item.label}</p>
                    <p className="text-xs text-[#1A1917] font-[300] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#EDEBE6]" />

            {/* Milestones */}
            <div>
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-3">Milestones</p>
              <div className="space-y-2">
                {selected.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        m.done ? "bg-[#2D6A4F]" : "border border-[#CDCAC4]"
                      }`}
                    >
                      {m.done && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5">
                          <path d="M1.5 4l2 2 3-3" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-xs font-[300] ${m.done ? "text-[#b0a89e] line-through" : "text-[#1A1917]"}`}>
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#EDEBE6]" />

            {/* Due date */}
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">Due</p>
              <p className="text-xs text-[#1A1917] font-[300]">
                {new Date(selected.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Notes from strategist */}
            {selected.notes && (
              <>
                <div className="border-t border-[#EDEBE6]" />
                <div>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Strategist notes</p>
                  <p className="text-xs text-[#5a5450] font-[300] leading-relaxed">{selected.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
