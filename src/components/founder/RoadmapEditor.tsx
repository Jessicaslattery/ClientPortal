"use client";

import { useActionState } from "react";
import { saveRoadmapAction } from "@/app/(founder)/clients/[id]/roadmap/actions";

type Week = { week: number; focus: string; priority: string; milestone: string };

const PHASE_THEMES = [
  "Diagnose & Strategise",
  "Build & Implement",
  "Scale & Optimise",
  "Revenue & Sales",
  "Systems & Automation",
  "Content & Visibility",
  "Client Experience",
  "Team & Delegation",
];

export function RoadmapEditor({
  clientProfileId,
  roadmapId,
  defaultTitle,
  defaultStartDate,
  defaultPhase1,
  defaultPhase2,
  defaultPhase3,
  weeks,
}: {
  clientProfileId: string;
  roadmapId: string | null;
  defaultTitle: string;
  defaultStartDate: string;
  defaultPhase1: string;
  defaultPhase2: string;
  defaultPhase3: string;
  weeks: Week[];
}) {
  const [state, formAction, pending] = useActionState(saveRoadmapAction, {});

  const phases = [
    { label: "Phase 1 — Month 1", weeks: weeks.slice(0, 4), defaultFocus: defaultPhase1, name: "phase1Focus" },
    { label: "Phase 2 — Month 2", weeks: weeks.slice(4, 8), defaultFocus: defaultPhase2, name: "phase2Focus" },
    { label: "Phase 3 — Month 3", weeks: weeks.slice(8, 12), defaultFocus: defaultPhase3, name: "phase3Focus" },
  ];

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="clientProfileId" value={clientProfileId} />
      {roadmapId && <input type="hidden" name="roadmapId" value={roadmapId} />}

      {/* Header fields */}
      <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-4"
        style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1.5 block">Roadmap title</label>
            <input
              name="title"
              defaultValue={defaultTitle}
              className="w-full rounded-2xl border border-[#E8E2D9] bg-[#F5F2ED] px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1.5 block">Start date</label>
            <input
              name="startDate"
              type="date"
              defaultValue={defaultStartDate}
              className="w-full rounded-2xl border border-[#E8E2D9] bg-[#F5F2ED] px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]"
            />
          </div>
        </div>
      </div>

      {/* Phases */}
      {phases.map((phase, pi) => (
        <div key={pi} className="space-y-3">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8277]">{phase.label}</h2>
            <div className="flex-1">
              <input
                name={phase.name}
                list={`themes-${pi}`}
                defaultValue={phase.defaultFocus}
                placeholder="Phase theme or focus area…"
                className="w-full rounded-xl border border-[#E8E2D9] bg-[#F5F2ED] px-3 py-1.5 text-xs text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]"
              />
              <datalist id={`themes-${pi}`}>
                {PHASE_THEMES.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {phase.weeks.map((w) => (
              <div key={w.week} className="px-6 py-4 grid grid-cols-[60px_1fr_1fr_1fr] gap-4 items-start">
                <div className="pt-1">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Week</span>
                  <p className="font-display text-2xl font-thin text-[#C8B89A]">{w.week}</p>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Weekly focus</label>
                  <textarea
                    name={`week_${w.week}_focus`}
                    defaultValue={w.focus}
                    rows={2}
                    placeholder="What's the main focus this week?"
                    className="w-full rounded-xl border border-[#E8E2D9] bg-[#F5F2ED] px-3 py-2 text-xs text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Top priority</label>
                  <textarea
                    name={`week_${w.week}_priority`}
                    defaultValue={w.priority}
                    rows={2}
                    placeholder="The #1 action item"
                    className="w-full rounded-xl border border-[#E8E2D9] bg-[#F5F2ED] px-3 py-2 text-xs text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Milestone</label>
                  <textarea
                    name={`week_${w.week}_milestone`}
                    defaultValue={w.milestone}
                    rows={2}
                    placeholder="What does done look like?"
                    className="w-full rounded-xl border border-[#E8E2D9] bg-[#F5F2ED] px-3 py-2 text-xs text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}
      {state.success && <p className="text-xs text-[#2D6A4F]">Roadmap saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.15em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save roadmap"}
      </button>
    </form>
  );
}
