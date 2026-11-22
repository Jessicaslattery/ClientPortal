"use client";

import { useState } from "react";

type Tab = "business" | "competitor";

const HEALTH = [
  { category: "Profile & Bio",    rating: "strong",   note: "Bio is clear, keyword-rich and includes a strong CTA. Highlights are well-organised and on brand." },
  { category: "Content Mix",      rating: "building",  note: "Good mix of education and social proof. Add more personal brand content: audiences want to see the person behind the business." },
  { category: "Consistency",      rating: "building",  note: "Posted 3–4× per week in October, up from 1–2× in September. Aim for 5× in November to build momentum." },
  { category: "Engagement",       rating: "focus",    note: "Current engagement rate is 1.8%: industry average is 3–5%. Stories are underutilised; use polls and Q&As to drive replies." },
  { category: "Views → Leads",    rating: "strong",   note: "Link in bio has been clicked 47 times this month. DMs from content are converting: keep the CTA in every post consistent." },
  { category: "Hashtag Strategy", rating: "building",  note: "Currently using broad hashtags (1M+ posts). Shift to a mix of niche (10k–100k) for better discovery." },
  { category: "Reels Performance","rating": "building","note": "Average reel reach is 4,100 views. Hook quality is good. Experiment with longer hooks (3s vs 1s) and trending audio." },
];

const RATING_CONFIG = {
  strong:   { label: "Strong",      color: "#2D6A4F", bg: "#E5F2EC", dot: "#2D6A4F" },
  building: { label: "Building",    color: "#8C735A", bg: "#F5EFE5", dot: "#8C735A" },
  focus:    { label: "Focus area",  color: "#9B2335", bg: "#F9E5E8", dot: "#9B2335" },
};

const COMPETITORS = [
  { handle: "@yourbusiness",       followers: 3200,  postsPerWeek: 4,   engRate: 2.1, topFormat: "Reel",     isClient: true },
  { handle: "@bloomwellnessco",    followers: 12400, postsPerWeek: 6,   engRate: 4.3, topFormat: "Carousel", isClient: false },
  { handle: "@thefitfoundation_",  followers: 8900,  postsPerWeek: 5,   engRate: 3.8, topFormat: "Reel",     isClient: false },
  { handle: "@nourishwithpriya",   followers: 5600,  postsPerWeek: 3,   engRate: 5.1, topFormat: "Static",   isClient: false },
  { handle: "@wellnessbyjessica",  followers: 21000, postsPerWeek: 7,   engRate: 2.9, topFormat: "Reel",     isClient: false },
  { handle: "@movewithkate_au",    followers: 4100,  postsPerWeek: 4,   engRate: 6.2, topFormat: "Reel",     isClient: false },
];

const OPPORTUNITIES = [
  { title: "Underserved niche",   body: "No competitor is consistently posting educational carousel content. This format gets 2× the saves of reels in this category: a clear gap to own." },
  { title: "Audio trends",        body: "@wellnessbyjessica is growing fast using trending audio on reels. Matching their audio cadence with our hook quality could push reach above 8k." },
  { title: "Engagement rate gap", body: "@movewithkate_au has 6.2% engagement with just 4.1k followers by using polls + Q&As every 3 days. Replicating this in stories is a quick win." },
];

export function AuditDashboard() {
  const [tab, setTab] = useState<Tab>("business");

  const strong = HEALTH.filter((h) => h.rating === "strong").length;
  const building = HEALTH.filter((h) => h.rating === "building").length;
  const focus = HEALTH.filter((h) => h.rating === "focus").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Insights · Q4 2026</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">Account Audit</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#EDEBE6]">
        {(["business", "competitor"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs tracking-[0.08em] transition-colors -mb-px ${
              tab === t
                ? "text-[#1A1917] border-b-2 border-[#1A1917]"
                : "text-[#b0a89e] hover:text-[#1A1917]"
            }`}
          >
            {t === "business" ? "Business Audit" : "Competitor Audit"}
          </button>
        ))}
      </div>

      {/* Business Audit */}
      {tab === "business" && (
        <div className="space-y-8">
          {/* Score summary */}
          <div className="flex gap-8">
            {[
              { title: "Strong",     value: strong,   dot: RATING_CONFIG.strong.dot },
              { title: "Building",   value: building, dot: RATING_CONFIG.building.dot },
              { title: "Focus area", value: focus,    dot: RATING_CONFIG.focus.dot },
            ].map((s) => (
              <div key={s.title} className="border-t-2 pt-3" style={{ borderColor: s.dot }}>
                <p className="text-[9px] tracking-[0.18em] uppercase" style={{ color: s.dot }}>{s.title}</p>
                <p className="text-3xl font-[200] mt-1 text-[#1A1917]">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Health ratings */}
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-4">Profile Health</p>
            <div className="border border-[#EDEBE6] rounded-xl overflow-hidden">
              {HEALTH.map((item, i) => {
                const rc = RATING_CONFIG[item.rating as keyof typeof RATING_CONFIG];
                return (
                  <div key={item.category} className={`flex items-start gap-4 px-5 py-5 ${i > 0 ? "border-t border-[#EDEBE6]" : ""}`}>
                    <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: rc.dot }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className="text-sm text-[#1A1917] font-[300]">{item.category}</p>
                        <span className="text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded"
                          style={{ color: rc.color, background: rc.bg }}>{rc.label}</span>
                      </div>
                      <p className="text-xs text-[#6d675e] leading-relaxed">{item.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategist notes */}
          <div className="border border-[#EDEBE6] rounded-xl p-6 space-y-4">
            <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Strategist Notes: Q4 2026</p>
            <p className="text-sm text-[#1A1917] leading-relaxed font-[300]">
              You&apos;ve made solid progress this quarter. The biggest lever right now is engagement: your content quality is high but replies and saves are below your reach potential. The November plan is designed specifically to close this gap with more interactive story content and stronger CTAs throughout posts. If we hit a 3%+ engagement rate by end of November, you&apos;re in an excellent position heading into Q1.
            </p>
            <p className="text-xs text-[#b0a89e]">Next audit: February 2027</p>
          </div>
        </div>
      )}

      {/* Competitor Audit */}
      {tab === "competitor" && (
        <div className="space-y-8">
          {/* Competitor table */}
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-4">Competitor Landscape</p>
            <div className="border border-[#EDEBE6] rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-[#F5F3EF] border-b border-[#EDEBE6]">
                {["Account", "Followers", "Posts/wk", "Eng rate", "Top format"].map((h) => (
                  <p key={h} className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{h}</p>
                ))}
              </div>
              {COMPETITORS.map((c, i) => (
                <div
                  key={c.handle}
                  className={`grid grid-cols-5 gap-4 px-5 py-4 items-center ${
                    i > 0 ? "border-t border-[#EDEBE6]" : ""
                  } ${c.isClient ? "bg-[#F5F3EF]" : ""}`}
                >
                  <div>
                    <p className="text-sm font-[300]" style={{ color: c.isClient ? "#1A1917" : "#1A1917" }}>
                      {c.handle}
                    </p>
                    {c.isClient && <span className="text-[9px] text-[#8C735A]">← you</span>}
                  </div>
                  <p className="text-sm text-[#1A1917] font-[300]">{c.followers.toLocaleString()}</p>
                  <p className="text-sm text-[#1A1917] font-[300]">{c.postsPerWeek}×</p>
                  <p className={`text-sm font-[300] ${c.engRate >= 4 ? "text-[#2D6A4F]" : c.engRate >= 2.5 ? "text-[#8C735A]" : "text-[#9B2335]"}`}>
                    {c.engRate}%
                  </p>
                  <p className="text-sm text-[#6d675e] font-[300]">{c.topFormat}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-4">Opportunities</p>
            <div className="space-y-3">
              {OPPORTUNITIES.map((op) => (
                <div key={op.title} className="border border-[#EDEBE6] rounded-xl p-5">
                  <p className="text-sm text-[#1A1917] font-[400] mb-1.5">{op.title}</p>
                  <p className="text-xs text-[#6d675e] leading-relaxed">{op.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
