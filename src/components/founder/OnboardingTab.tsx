"use client";

import { useState } from "react";
import { triggerOnboardingStep } from "@/app/(founder)/clients/[id]/onboarding-actions";

type OnboardingStep = {
  id: string;
  step: number;
  status: string;
  completedAt: Date | null;
  agentDraftId: string | null;
};

type IntakeSummary = {
  submittedAt: Date | null;
  whatTheyDo: string;
  whoTheyServe: string;
  howLongTrading: string;
  currentRevenue: string;
  revenueGoal: string;
  biggestChallenge: string;
  whatTheyTried: string;
  whatIsWorking: string;
  whatIsNot: string;
  currentTools: string;
  teamSituation: string;
  contentPlatforms: string;
  workingHoursPerWeek: number | null;
  energyLevel: number | null;
  biggestPersonalBlock: string;
  goalOne: string;
  goalTwo: string;
  goalThree: string;
  successIn6Months: string;
  personalStory: string;
  clientsFeedback: string;
  industryBelief: string;
  dailyRoutine: string;
  mostProudOf: string;
} | null;

type FirstCallNotes = string | null;

type Props = {
  clientId: string;
  steps: OnboardingStep[];
  intake: IntakeSummary;
  firstCallNotes: FirstCallNotes;
};

const stepLabels: Record<number, string> = {
  1: "Welcome message",
  2: "Intake form introduction",
  3: "Intake received",
  4: "First call confirmation",
};

function stepStatusColour(status: string) {
  if (status === "complete") return "text-[#2D6A4F] bg-[#2D6A4F]/10";
  if (status === "pending") return "text-[#8C8277] bg-[#F5F0E8]";
  return "text-[#C8B89A] bg-[#C8B89A]/10";
}

export function OnboardingTab({ clientId, steps, intake, firstCallNotes }: Props) {
  const [loading, setLoading] = useState<number | null>(null);
  const [triggered, setTriggered] = useState<Set<number>>(new Set());

  async function handleTrigger(step: 2 | 3 | 4) {
    setLoading(step);
    try {
      await triggerOnboardingStep(clientId, step);
      setTriggered((prev) => new Set([...prev, step]));
    } finally {
      setLoading(null);
    }
  }

  const intakeUrl = `/onboarding/${clientId}`;

  return (
    <div className="space-y-6">
      {/* Step progress */}
      <div className="rounded-2xl border border-[#E8E2D9] p-5">
        <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-5">
          Onboarding progress
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((stepNum) => {
            const stepData = steps.find((s) => s.step === stepNum);
            const status = stepData?.status ?? "pending";
            return (
              <div key={stepNum} className="flex items-start justify-between gap-4 py-2 border-b border-[#F5F0E8] last:border-0">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 mt-0.5 ${
                    status === "complete" ? "bg-[#2D6A4F] text-white" : "bg-[#E8E2D9] text-[#8C8277]"
                  }`}>
                    {status === "complete" ? "✓" : stepNum}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#1A1714]">{stepLabels[stepNum]}</p>
                    {stepData?.completedAt && (
                      <p className="text-xs text-[#8C8277] mt-0.5">
                        Sent {new Date(stepData.completedAt).toLocaleDateString("en-AU", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-1 rounded-full tracking-wide ${stepStatusColour(status)}`}>
                    {status}
                  </span>
                  {stepNum > 1 && status !== "complete" && !triggered.has(stepNum) && (
                    <button
                      onClick={() => handleTrigger(stepNum as 2 | 3 | 4)}
                      disabled={loading !== null}
                      className="text-[10px] tracking-[0.1em] uppercase px-3 py-1 rounded-lg border border-[#E8E2D9] text-[#5C5550] hover:border-[#C8B89A] hover:text-[#1A1714] transition-colors disabled:opacity-50"
                    >
                      {loading === stepNum ? "…" : "Trigger"}
                    </button>
                  )}
                  {triggered.has(stepNum) && (
                    <span className="text-[10px] text-[#2D6A4F]">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intake form link */}
      <div className="rounded-2xl border border-[#E8E2D9] p-5">
        <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">
          Intake form
        </h3>
        <div className="flex items-center justify-between">
          <div>
            {intake?.submittedAt ? (
              <p className="text-sm text-[#2D6A4F]">
                Submitted {new Date(intake.submittedAt).toLocaleDateString("en-AU", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            ) : (
              <p className="text-sm text-[#8C8277]">Not yet submitted</p>
            )}
          </div>
          <a
            href={intakeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.1em] uppercase px-4 py-2 rounded-lg border border-[#E8E2D9] text-[#5C5550] hover:border-[#C8B89A] hover:text-[#1A1714] transition-colors"
          >
            Open intake form ↗
          </a>
        </div>
      </div>

      {/* Intake answers */}
      {intake?.submittedAt && (
        <div className="rounded-2xl border border-[#E8E2D9] p-5 space-y-6">
          <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Intake answers</h3>

          {[
            { section: "The Business", fields: [
              { label: "What they do", value: intake.whatTheyDo },
              { label: "Who they serve", value: intake.whoTheyServe },
              { label: "How long trading", value: intake.howLongTrading },
              { label: "Current revenue", value: intake.currentRevenue },
              { label: "Revenue goal", value: intake.revenueGoal },
              { label: "Team situation", value: intake.teamSituation },
              { label: "Current tools", value: intake.currentTools },
              { label: "Content platforms", value: intake.contentPlatforms },
              { label: "Working hours/week", value: intake.workingHoursPerWeek ? `${intake.workingHoursPerWeek} hrs` : "" },
            ]},
            { section: "Challenges & Goals", fields: [
              { label: "Biggest challenge", value: intake.biggestChallenge },
              { label: "What they've tried", value: intake.whatTheyTried },
              { label: "What is working", value: intake.whatIsWorking },
              { label: "What is not working", value: intake.whatIsNot },
              { label: "Goal 1", value: intake.goalOne },
              { label: "Goal 2", value: intake.goalTwo },
              { label: "Goal 3", value: intake.goalThree },
              { label: "Success in 6 months", value: intake.successIn6Months },
            ]},
            { section: "Personal & Mindset", fields: [
              { label: "Energy level", value: intake.energyLevel ? `${intake.energyLevel}/10` : "" },
              { label: "Biggest personal block", value: intake.biggestPersonalBlock },
              { label: "Daily routine", value: intake.dailyRoutine },
              { label: "Most proud of", value: intake.mostProudOf },
              { label: "Personal story", value: intake.personalStory },
              { label: "Client feedback", value: intake.clientsFeedback },
              { label: "Industry belief", value: intake.industryBelief },
            ]},
          ].map(({ section, fields }) => {
            const filled = fields.filter(f => f.value);
            if (filled.length === 0) return null;
            return (
              <div key={section}>
                <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8B89A] mb-3">{section}</p>
                <div className="space-y-3">
                  {filled.map(({ label, value }) => (
                    <div key={label} className="border-b border-[#F5F0E8] pb-3 last:border-0 last:pb-0">
                      <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">{label}</p>
                      <p className="text-sm text-[#1A1714] leading-6">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* First call notes (founderNote from step 3) */}
      {firstCallNotes && (
        <div className="rounded-2xl bg-[#C8B89A]/10 border border-[#C8B89A]/30 p-5">
          <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#C8B89A] mb-3">
            First call notes
          </h3>
          <p className="text-sm text-[#5C5550] leading-7 whitespace-pre-wrap">{firstCallNotes}</p>
        </div>
      )}
    </div>
  );
}
