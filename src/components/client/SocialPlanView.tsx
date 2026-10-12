"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestSocialPlanAction } from "@/app/(client)/social-plan/actions";

type Plan = {
  id: string;
  monthNumber: number;
  year: number;
  brandVoiceNotes?: string | null;
  contentPillars?: string | null;
  storyOutlines?: string | null;
  dailyPostingGuide?: string | null;
  socialAudit?: string | null;
};

type PastPlan = {
  id: string;
  monthNumber: number;
  year: number;
  contentPillars?: string | null;
  storyOutlines?: string | null;
  dailyPostingGuide?: string | null;
};

function parsePillars(text: string): { name: string; pct: number; rationale: string }[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const results: { name: string; pct: number; rationale: string }[] = [];
  for (const line of lines) {
    const pctMatch = line.match(/(\d+)%/);
    const pct = pctMatch ? parseInt(pctMatch[1]) : 25;
    const cleanLine = line.replace(/^\W+/, "").replace(/\d+%/, "").replace(/^[-–—\s]+/, "").trim();
    if (cleanLine.length > 2) {
      const parts = cleanLine.split(/[—:]/);
      results.push({ name: parts[0]?.trim() ?? cleanLine, pct, rationale: parts.slice(1).join(" ").trim() });
    }
  }
  const seen = new Set<string>();
  return results.filter((r) => { if (seen.has(r.name)) return false; seen.add(r.name); return true; }).slice(0, 4);
}

const PILLAR_COLORS_LIST = ["#2D6A4F", "#B7791F", "#C8B89A", "#5C5550", "#8C8277"];

const initial: { error?: string; success?: string } = {};

function PillarsSection({ pillars }: { pillars: { name: string; pct: number; rationale: string }[] }) {
  const top3 = pillars.slice(0, 3);
  return (
    <div className="grid grid-cols-3 gap-4">
      {top3.map((p, i) => (
        <div key={i} className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-[#1A1714] font-medium leading-5">{p.name}</p>
            <span className="font-display text-2xl font-thin shrink-0" style={{ color: PILLAR_COLORS_LIST[i] }}>{p.pct}%</span>
          </div>
          <div className="h-1 bg-[#F2EDE4] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: PILLAR_COLORS_LIST[i] }} />
          </div>
          {p.rationale && <p className="text-xs text-[#5C5550] leading-5">{p.rationale}</p>}
        </div>
      ))}
    </div>
  );
}

export function SocialPlanView({
  currentPlan, pastPlans, currentMonthName, currentYear, months,
}: {
  currentPlan: Plan | null;
  pastPlans: PastPlan[];
  currentMonthName: string;
  currentYear: number;
  months: string[];
}) {
  const [requestState, requestAction, requestPending] = useActionState(requestSocialPlanAction, initial);

  const pillars = currentPlan?.contentPillars ? parsePillars(currentPlan.contentPillars) : [];
  const planMonth = currentPlan ? months[currentPlan.monthNumber - 1] : currentMonthName;
  const planYear = currentPlan ? currentPlan.year : currentYear;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-light text-[#1A1714]">{planMonth} {planYear}</h2>
          <p className="text-xs text-[#8C8277] mt-0.5">Your monthly content strategy</p>
        </div>
        <Link href="/content-calendar"
          className="px-4 py-2 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors">
          Go to Content Calendar
        </Link>
      </div>

      {!currentPlan && (
        <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-8 text-center space-y-4">
          <p className="text-sm text-[#5C5550]">No strategy published for {currentMonthName} {currentYear} yet.</p>
          <form action={requestAction}>
            <button type="submit" disabled={requestPending}
              className="px-5 py-2.5 rounded-full bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-50">
              {requestPending ? "Sending…" : "Request this month's plan"}
            </button>
          </form>
          {requestState.error && <p className="text-xs text-[#9B2335]">{requestState.error}</p>}
          {requestState.success && <p className="text-xs text-[#2D6A4F]">{requestState.success}</p>}
        </div>
      )}

      {currentPlan && (
        <>
          {/* Content Pillars */}
          {pillars.length > 0 && (
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">Content pillars</p>
              <PillarsSection pillars={pillars} />
            </div>
          )}

          {currentPlan.brandVoiceNotes && <ContentSection title="Brand Voice & Positioning" content={currentPlan.brandVoiceNotes} />}
          {currentPlan.storyOutlines && <ContentSection title="Daily Story Outlines · Weeks 1 & 2" content={currentPlan.storyOutlines} />}
          {currentPlan.dailyPostingGuide && <ContentSection title="Daily Posting Guide" content={currentPlan.dailyPostingGuide} />}
          {currentPlan.socialAudit && <ContentSection title="Last Month Audit" content={currentPlan.socialAudit} />}
        </>
      )}

      {pastPlans.length > 0 && <PastPlansSection pastPlans={pastPlans} months={months} />}
    </div>
  );
}

function ContentSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6">
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">{title}</p>
      <div className="text-sm text-[#5C5550] leading-7 whitespace-pre-wrap">{content}</div>
    </div>
  );
}

function PastPlansSection({ pastPlans, months }: { pastPlans: PastPlan[]; months: string[] }) {
  return (
    <div>
      <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">Previous plans</h2>
      <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
        {pastPlans.map((plan) => (
          <details key={plan.id} className="group">
            <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer list-none hover:bg-[#F5F2ED] transition-colors">
              <span className="text-sm text-[#1A1714]">{months[plan.monthNumber - 1]} {plan.year}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-[#8C8277] group-open:rotate-180 transition-transform">
                <path d="M2 3.5l3 3 3-3" />
              </svg>
            </summary>
            <div className="border-t border-[#E8E2D9] px-5 py-5 space-y-4">
              {plan.contentPillars && (
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Content Pillars</p>
                  <p className="text-sm text-[#5C5550] leading-6 whitespace-pre-wrap">{plan.contentPillars}</p>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
