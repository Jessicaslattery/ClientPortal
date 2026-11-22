"use client";

import { useState } from "react";

type Period = "this_month" | "last_month" | "last_3";

const PERIOD_LABELS: Record<Period, string> = {
  this_month: "November 2026",
  last_month: "October 2026",
  last_3: "Sep–Nov 2026",
};

const DATA: Record<Period, {
  followers: number; followersDelta: number;
  reach: number; reachDelta: number;
  impressions: number; impressionsDelta: number;
  engRate: number; engRateDelta: number;
  profileVisits: number; profileVisitsDelta: number;
  linkClicks: number; linkClicksDelta: number;
  posts: number; stories: number; reels: number;
  topPosts: { title: string; format: string; reach: number; likes: number; saves: number; engRate: number; pillarColor: string }[];
  weekly: { week: string; reach: number; followers: number }[];
}> = {
  this_month: {
    followers: 3200, followersDelta: 142,
    reach: 41800, reachDelta: 18,
    impressions: 68400, impressionsDelta: 22,
    engRate: 2.1, engRateDelta: 0.3,
    profileVisits: 1240, profileVisitsDelta: 31,
    linkClicks: 47, linkClicksDelta: -8,
    posts: 7, stories: 8, reels: 5,
    topPosts: [
      { title: "Quick tip reel: hook",    format: "Reel",     reach: 7200, likes: 490, saves: 118, engRate: 8.5,  pillarColor: "#2D5F8A" },
      { title: "Client result carousel",   format: "Carousel", reach: 6800, likes: 541, saves: 97,  engRate: 9.4,  pillarColor: "#2D6A4F" },
      { title: "Team day BTS",             format: "Reel",     reach: 5600, likes: 356, saves: 55,  engRate: 7.3,  pillarColor: "#8C735A" },
      { title: "Common mistake reel",      format: "Reel",     reach: 5100, likes: 288, saves: 61,  engRate: 6.8,  pillarColor: "#2D5F8A" },
      { title: "Morning routine reel",     format: "Reel",     reach: 4200, likes: 312, saves: 48,  engRate: 8.6,  pillarColor: "#8C735A" },
    ],
    weekly: [
      { week: "28 Oct",  reach: 7800,  followers: 3058 },
      { week: "4 Nov",   reach: 9200,  followers: 3098 },
      { week: "11 Nov",  reach: 11400, followers: 3142 },
      { week: "18 Nov",  reach: 13200, followers: 3200 },
    ],
  },
  last_month: {
    followers: 3058, followersDelta: 89,
    reach: 35400, reachDelta: 8,
    impressions: 56100, impressionsDelta: 11,
    engRate: 1.8, engRateDelta: -0.2,
    profileVisits: 946, profileVisitsDelta: 12,
    linkClicks: 51, linkClicksDelta: 15,
    posts: 5, stories: 6, reels: 3,
    topPosts: [
      { title: "Transformation story",    format: "Carousel", reach: 8100, likes: 612, saves: 110, engRate: 9.0, pillarColor: "#2D6A4F" },
      { title: "October offer post",      format: "Reel",     reach: 6200, likes: 398, saves: 72,  engRate: 7.6, pillarColor: "#9B4F2A" },
      { title: "Behind the scenes shoot", format: "Reel",     reach: 5400, likes: 290, saves: 48,  engRate: 6.3, pillarColor: "#8C735A" },
    ],
    weekly: [
      { week: "30 Sep",  reach: 7100,  followers: 2969 },
      { week: "7 Oct",   reach: 8300,  followers: 2998 },
      { week: "14 Oct",  reach: 9800,  followers: 3028 },
      { week: "21 Oct",  reach: 10200, followers: 3058 },
    ],
  },
  last_3: {
    followers: 3200, followersDelta: 312,
    reach: 112600, reachDelta: 24,
    impressions: 183900, impressionsDelta: 28,
    engRate: 2.0, engRateDelta: 0.6,
    profileVisits: 3310, profileVisitsDelta: 41,
    linkClicks: 148, linkClicksDelta: 22,
    posts: 17, stories: 22, reels: 13,
    topPosts: [
      { title: "Quick tip reel: hook",   format: "Reel",     reach: 7200, likes: 490, saves: 118, engRate: 8.5, pillarColor: "#2D5F8A" },
      { title: "Client result carousel",  format: "Carousel", reach: 6800, likes: 541, saves: 97,  engRate: 9.4, pillarColor: "#2D6A4F" },
      { title: "Transformation story",    format: "Carousel", reach: 8100, likes: 612, saves: 110, engRate: 9.0, pillarColor: "#2D6A4F" },
    ],
    weekly: [
      { week: "Sep W1",  reach: 6100,  followers: 2888 },
      { week: "Sep W3",  reach: 7800,  followers: 2929 },
      { week: "Oct W1",  reach: 8300,  followers: 2969 },
      { week: "Oct W3",  reach: 10200, followers: 3028 },
      { week: "Nov W1",  reach: 9200,  followers: 3098 },
      { week: "Nov W3",  reach: 13200, followers: 3200 },
    ],
  },
};

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const pos = value >= 0;
  return (
    <span className={`text-xs font-[300] ${pos ? "text-[#2D6A4F]" : "text-[#9B2335]"}`}>
      {pos ? "+" : ""}{value}{suffix}
    </span>
  );
}

function SparkBar({ values, color = "#1A1917" }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${(v / max) * 100}%`, background: i === values.length - 1 ? color : `${color}40` }}
        />
      ))}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("this_month");
  const d = DATA[period];

  const kpis = [
    { label: "Followers", value: d.followers.toLocaleString(), delta: d.followersDelta, suffix: "" },
    { label: "Reach", value: d.reach.toLocaleString(), delta: d.reachDelta, suffix: "%" },
    { label: "Impressions", value: d.impressions.toLocaleString(), delta: d.impressionsDelta, suffix: "%" },
    { label: "Eng. Rate", value: `${d.engRate}%`, delta: d.engRateDelta, suffix: "pp" },
    { label: "Profile Visits", value: d.profileVisits.toLocaleString(), delta: d.profileVisitsDelta, suffix: "%" },
    { label: "Link Clicks", value: d.linkClicks.toLocaleString(), delta: d.linkClicksDelta, suffix: "%" },
  ];

  const reachMax = Math.max(...d.weekly.map((w) => w.reach));

  const [igConnected, setIgConnected] = useState(false);
  const [igConnecting, setIgConnecting] = useState(false);

  function handleIgConnect() {
    setIgConnecting(true);
    setTimeout(() => { setIgConnecting(false); setIgConnected(true); }, 1800);
  }

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Insights</p>
          <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          {!igConnected ? (
            <button
              onClick={handleIgConnect}
              disabled={igConnecting}
              className="flex items-center gap-2 px-4 py-2 border border-[#EDEBE6] rounded-xl text-xs text-[#6d675e] hover:border-[#1A1917] hover:text-[#1A1917] transition-all disabled:opacity-60"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              {igConnecting ? "Connecting..." : "Connect Instagram"}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#E5F2EC] border border-[#2D6A4F]30 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
              <span className="text-xs text-[#2D6A4F]">@bloomwellness.co connected</span>
            </div>
          )}
        </div>
        <div className="flex border border-[#EDEBE6] rounded-lg overflow-hidden">
          {(["this_month", "last_month", "last_3"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-[10px] tracking-[0.08em] uppercase transition-colors ${
                period === p ? "bg-[#1A1917] text-white" : "text-[#6d675e] hover:text-[#1A1917] hover:bg-[#F5F3EF]"
              }`}
            >
              {p === "this_month" ? "This month" : p === "last_month" ? "Last month" : "3 months"}
            </button>
          ))}
        </div>
      </div>

      {/* Period label */}
      <p className="text-[11px] tracking-[0.14em] uppercase text-[#b0a89e] -mt-6">{PERIOD_LABELS[period]}</p>

      {/* KPI tiles */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
        {kpis.map((k) => (
          <div key={k.label} className="border-t border-[#1A1917] pt-3">
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{k.label}</p>
            <p className="text-2xl font-[200] text-[#1A1917] mt-1">{k.value}</p>
            <div className="mt-1">
              <Delta value={k.delta} suffix={k.suffix} />
            </div>
          </div>
        ))}
      </div>

      {/* Content breakdown */}
      <div className="border-t border-[#EDEBE6] pt-8 grid grid-cols-3 gap-4">
        {[
          { label: "Posts published", value: d.posts },
          { label: "Stories published", value: d.stories },
          { label: "Reels published", value: d.reels },
        ].map((s) => (
          <div key={s.label} className="border border-[#EDEBE6] rounded-xl p-5">
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{s.label}</p>
            <p className="text-3xl font-[200] text-[#1A1917] mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly reach chart */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-5">Weekly Reach</p>
        <div className="border border-[#EDEBE6] rounded-xl p-5">
          <div className="flex items-end gap-2">
            {d.weekly.map((w, i) => (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-[9px] text-[#b0a89e]">{w.reach.toLocaleString()}</p>
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${Math.round((w.reach / reachMax) * 80)}px`,
                    background: i === d.weekly.length - 1 ? "#1A1917" : "#EDEBE6",
                  }}
                />
                <p className="text-[9px] text-[#b0a89e] text-center">{w.week}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follower growth sparkline */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-5">Follower Growth</p>
        <div className="border border-[#EDEBE6] rounded-xl p-5">
          <div className="flex items-center gap-6 mb-4">
            <div>
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">Start</p>
              <p className="text-xl font-[200] text-[#1A1917]">{d.weekly[0].followers.toLocaleString()}</p>
            </div>
            <div className="flex-1 border-t border-dashed border-[#EDEBE6]" />
            <div className="text-right">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">End</p>
              <p className="text-xl font-[200] text-[#1A1917]">{d.weekly[d.weekly.length - 1].followers.toLocaleString()}</p>
            </div>
          </div>
          <SparkBar values={d.weekly.map((w) => w.followers)} color="#8C735A" />
          <div className="flex justify-between mt-2">
            {d.weekly.map((w) => (
              <p key={w.week} className="text-[9px] text-[#b0a89e]">{w.week}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Top posts */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-4">Top Performing Posts</p>
        <div className="border border-[#EDEBE6] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_60px_60px_70px_70px] gap-4 px-5 py-3 bg-[#F5F3EF] border-b border-[#EDEBE6]">
            {["Post", "Format", "Reach", "Likes", "Saves", "Eng. rate"].map((h) => (
              <p key={h} className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{h}</p>
            ))}
          </div>
          {d.topPosts.map((p, i) => (
            <div key={p.title} className={`grid grid-cols-[1fr_80px_60px_60px_70px_70px] gap-4 px-5 py-4 items-center ${i > 0 ? "border-t border-[#EDEBE6]" : ""}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.pillarColor }} />
                <p className="text-sm text-[#1A1917] font-[300] truncate">{p.title}</p>
              </div>
              <span className="text-[10px] tracking-[0.06em] uppercase text-[#8C735A] bg-[#F5EFE5] px-2 py-0.5 rounded w-fit">{p.format}</span>
              <p className="text-sm text-[#1A1917] font-[300]">{p.reach.toLocaleString()}</p>
              <p className="text-sm text-[#1A1917] font-[300]">{p.likes}</p>
              <p className="text-sm text-[#1A1917] font-[300]">{p.saves}</p>
              <p className={`text-sm font-[300] ${p.engRate >= 7 ? "text-[#2D6A4F]" : p.engRate >= 5 ? "text-[#8C735A]" : "text-[#1A1917]"}`}>{p.engRate}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategist note */}
      <div className="border border-[#EDEBE6] rounded-xl p-6">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-3">Strategist Note: {PERIOD_LABELS[period]}</p>
        <p className="text-sm text-[#1A1917] font-[300] leading-relaxed">
          Reels continue to outperform all other formats on reach, with your top reel hitting 7.2k this month.
          Carousels are driving the highest engagement rate and saves: the client testimonial carousel is a standout.
          Focus for next month: improve link-in-bio clicks (down 8%) by adding a stronger verbal CTA in the final frame of each reel.
        </p>
      </div>
    </div>
  );
}
