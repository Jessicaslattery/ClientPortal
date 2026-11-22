"use client";

import { useState } from "react";
import Link from "next/link";

const DAILY_TASKS = [
  { id: "1", task: "Post today's reel (mindset + burnout hook)", done: true,  type: "post" },
  { id: "2", task: "Reply to DMs and comments from yesterday",  done: true,  type: "engage" },
  { id: "3", task: "Post 3 stories: poll, behind-the-scenes, CTA", done: false, type: "story" },
  { id: "4", task: "Save 3 pieces of inspiration to Canva board", done: false, type: "research" },
  { id: "5", task: "Film 2 reels for the content bank",          done: false, type: "film" },
];

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  post:     { color: "#2D6A4F", bg: "#E5F2EC" },
  engage:   { color: "#2D5F8A", bg: "#E5EEF7" },
  story:    { color: "#8C735A", bg: "#F5EFE5" },
  research: { color: "#7B746B", bg: "#F5F1EB" },
  film:     { color: "#9B4F2A", bg: "#F5EAE0" },
};

export default function SmsOverviewPage() {
  const [tasks, setTasks] = useState(DAILY_TASKS);

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  const doneTasks = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">November 2026</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">Monthly Overview</h1>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Reach",   value: "41,800", delta: "+18%",   color: "#2D6A4F" },
          { label: "Eng. Rate",     value: "2.1%",   delta: "+0.3pp", color: "#2D6A4F" },
          { label: "Followers",     value: "3,200",  delta: "+142",   color: "#2D6A4F" },
          { label: "Plan Complete", value: "44%",    delta: "7/16",   color: "#8C735A" },
        ].map((k) => (
          <div key={k.label} className="border-t border-[#1A1917] pt-3">
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{k.label}</p>
            <p className="text-2xl font-[200] text-[#1A1917] mt-1">{k.value}</p>
            <p className="text-xs font-[300] mt-1" style={{ color: k.color }}>{k.delta}</p>
          </div>
        ))}
      </div>

      {/* Daily tasks */}
      <div className="border border-[#EDEBE6] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#F5F3EF] border-b border-[#EDEBE6]">
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">Today</p>
            <p className="text-sm text-[#1A1917] font-[300] mt-0.5">Monday, 17 November</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-[200] text-[#1A1917]">{doneTasks}<span className="text-sm text-[#b0a89e] ml-1">/ {tasks.length}</span></p>
            <p className="text-[9px] text-[#b0a89e]">tasks done</p>
          </div>
        </div>
        <div className="divide-y divide-[#EDEBE6]">
          {tasks.map((task) => {
            const tc = TYPE_COLORS[task.type];
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F5F3EF]/50 transition-colors text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    task.done ? "bg-[#2D6A4F]" : "border border-[#CDCAC4]"
                  }`}
                >
                  {task.done && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.5">
                      <path d="M1.5 4.5l2 2 4-4" />
                    </svg>
                  )}
                </div>
                <p className={`flex-1 text-sm font-[300] transition-colors ${task.done ? "line-through text-[#b0a89e]" : "text-[#1A1917]"}`}>
                  {task.task}
                </p>
                <span
                  className="text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: tc.color, background: tc.bg }}
                >
                  {task.type}
                </span>
              </button>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-[#EDEBE6]">
          <div className="h-1.5 bg-[#EDEBE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D6A4F] rounded-full transition-all"
              style={{ width: `${(doneTasks / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/social/posts",     label: "Post Schedule",  desc: "16 posts planned for November, 7 posted" },
          { href: "/social/stories",   label: "Story Schedule", desc: "15 stories planned, 7 posted" },
          { href: "/social/analytics", label: "Analytics",      desc: "Reach, followers, top posts and engagement" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="border border-[#EDEBE6] rounded-xl p-5 hover:border-[#1A1917] transition-colors group"
          >
            <p className="text-sm text-[#1A1917] font-[400] group-hover:underline">{l.label}</p>
            <p className="text-xs text-[#b0a89e] mt-1 leading-relaxed">{l.desc}</p>
          </Link>
        ))}
      </div>

      {/* Strategist notes */}
      <div className="border border-[#EDEBE6] rounded-xl p-6 space-y-4">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Strategist Notes, November 2026</p>
        <p className="text-sm text-[#1A1917] font-[300] leading-relaxed">
          Solid start to the month. Your reels are consistently outperforming on reach and your engagement rate is trending up.
          The focus this month is driving more link-in-bio clicks. We&apos;re adding a verbal CTA to the final frame of every reel and testing a stronger bio offer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#EDEBE6]">
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#2D6A4F] mb-1.5">What&apos;s working</p>
            <p className="text-xs text-[#1A1917] leading-relaxed">Educational reels with strong hooks are getting 2-3x average reach. The testimonial carousel was your best performing post this month.</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#9B2335] mb-1.5">Focus area</p>
            <p className="text-xs text-[#1A1917] leading-relaxed">Link-in-bio clicks dropped 8% despite higher reach. Stories are underutilised. We&apos;re adding more Q&As and polls in the second half of the month.</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#8C735A] mb-1.5">Next month</p>
            <p className="text-xs text-[#1A1917] leading-relaxed">December content shifts to end-of-year reflection and lead generation for January. Planning a 3-part reel series around client transformation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
