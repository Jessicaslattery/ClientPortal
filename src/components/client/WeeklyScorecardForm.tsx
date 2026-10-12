"use client";

import { useActionState, useState } from "react";
import { submitScorecardAction, updateTargetsAction } from "@/app/(client)/health/actions";
import { formatWeekLabel, getWeekStart } from "@/lib/healthScore";

type Targets = {
  revenueTarget: number;
  leadsTarget: number;
  callsBookedTarget: number;
  callsConvertedTarget: number;
  contentTarget: number;
  hoursTarget: number;
  energyTarget: number;
  monthlyRevenueTarget: number;
};

type ScorecardRow = {
  weekStart: Date;
  revenue: number | null;
  leads: number | null;
  callsBooked: number | null;
  callsConverted: number | null;
  contentPieces: number | null;
  hoursWorked: number | null;
  energyScore: number | null;
  contentEnquiries: number | null;
  currentClients: number | null;
  cancellations: number | null;
  avgClientValue: number | null;
  followerGrowth: number | null;
  bestPerformingPost: string | null;
  biggestWin: string | null;
  biggestBlock: string | null;
};

function rag(value: number | null, target: number): string {
  if (value == null) return "text-[#8C8277]";
  if (value >= target) return "text-[#2D6A4F]";
  if (value >= target * 0.6) return "text-[#B7791F]";
  return "text-[#9B2335]";
}

function ragDot(value: number | null, target: number): string {
  if (value == null) return "bg-[#E8E2D9]";
  if (value >= target) return "bg-[#2D6A4F]";
  if (value >= target * 0.6) return "bg-[#B7791F]";
  return "bg-[#9B2335]";
}

function Field({
  label, name, type = "number", value, target, suffix = "", min, max, step,
}: {
  label: string; name: string; type?: string; value?: number | null; target: number;
  suffix?: string; min?: number; max?: number; step?: number;
}) {
  const [v, setV] = useState(value?.toString() ?? "");
  const num = parseFloat(v);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-[#5C5550]">{label}</label>
        <span className="text-[10px] text-[#8C8277]">Target: {target}{suffix}</span>
      </div>
      {name === "energyScore" ? (
        <div className="flex items-center gap-3">
          <input
            type="range" name={name} min={1} max={10} step={1}
            value={v || "5"}
            onChange={(e) => setV(e.target.value)}
            className="flex-1 accent-[#C8B89A]"
          />
          <span className={`text-sm font-medium w-4 text-right ${rag(num, target)}`}>{v || "-"}</span>
        </div>
      ) : (
        <div className="relative">
          <input
            type="number" name={name} min={min} max={max} step={step ?? (type === "currency" ? 0.01 : 1)}
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="-"
            className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors pr-8"
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${ragDot(!isNaN(num) && v ? num : null, target)}`} />
        </div>
      )}
    </div>
  );
}

function SimpleField({
  label, name, value, type = "number", prefix, step,
}: {
  label: string; name: string; value?: number | null; type?: string; prefix?: string; step?: number;
}) {
  const [v, setV] = useState(value?.toString() ?? "");
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#5C5550] block">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8C8277]">{prefix}</span>
        )}
        <input
          type={type} name={name} step={step ?? 1}
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="-"
          className={`w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl py-2.5 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors ${prefix ? "pl-7 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

function TextAreaField({
  label, name, value,
}: {
  label: string; name: string; value?: string | null;
}) {
  const [v, setV] = useState(value ?? "");
  return (
    <div className="space-y-1.5 col-span-2">
      <label className="text-xs text-[#5C5550] block">{label}</label>
      <textarea
        name={name}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Type here…"
        rows={2}
        className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors resize-none"
      />
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <p className="col-span-2 text-[10px] tracking-[0.15em] uppercase text-[#8C8277] border-b border-[#E8E2D9] pb-2 mt-2">{label}</p>
  );
}

export function WeeklyScorecardForm({
  currentWeek,
  targets: initialTargets,
  history,
  totalExpenses,
}: {
  currentWeek: ScorecardRow | null;
  targets: Targets;
  history: ScorecardRow[];
  totalExpenses?: number;
}) {
  const [submitState, submitAction, pending] = useActionState(submitScorecardAction, {});
  const [targetState, targetAction, targetPending] = useActionState(updateTargetsAction, {});
  const [showTargets, setShowTargets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const t = initialTargets;

  const currentWeekStart = getWeekStart();
  const selectedWeekStart = new Date(currentWeekStart);
  selectedWeekStart.setUTCDate(selectedWeekStart.getUTCDate() + weekOffset * 7);
  const selectedWeekIso = selectedWeekStart.toISOString();

  const selectedRow: ScorecardRow | null =
    weekOffset === 0
      ? currentWeek
      : history.find(
          (r) => new Date(r.weekStart).toISOString().slice(0, 10) === selectedWeekStart.toISOString().slice(0, 10)
        ) ?? null;

  const weekLabel = formatWeekLabel(selectedWeekStart);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-thin tracking-widest text-[#1A1714] uppercase">Weekly Scorecard</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o - 1)}
              className="text-[#8C8277] hover:text-[#1A1714] transition-colors"
              aria-label="Previous week"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M9 2L4 7l5 5" />
              </svg>
            </button>
            <p className="text-xs text-[#8C8277]">{weekLabel}</p>
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              disabled={weekOffset >= 0}
              className="text-[#8C8277] hover:text-[#1A1714] disabled:opacity-30 transition-colors"
              aria-label="Next week"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M5 2l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {totalExpenses != null && totalExpenses > 0 && (
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#5C5550]">
              Monthly expenses: <span className="text-[#1A1714]">${totalExpenses.toLocaleString("en-AU")}</span>
            </span>
          )}
          <button
            onClick={() => setShowTargets(!showTargets)}
            className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors"
          >
            {showTargets ? "Hide targets" : "Edit targets"}
          </button>
        </div>
      </div>

      {/* Target editing panel */}
      {showTargets && (
        <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550] mb-4">Your Weekly Targets</p>
          <form action={targetAction} className="grid grid-cols-2 gap-4">
            {[
              { label: "Revenue target ($)", name: "revenueTarget", val: t.revenueTarget },
              { label: "Leads target", name: "leadsTarget", val: t.leadsTarget },
              { label: "Calls booked target", name: "callsBookedTarget", val: t.callsBookedTarget },
              { label: "Calls converted target", name: "callsConvertedTarget", val: t.callsConvertedTarget },
              { label: "Content pieces target", name: "contentTarget", val: t.contentTarget },
              { label: "Hours worked target", name: "hoursTarget", val: t.hoursTarget },
              { label: "Energy target (1–10)", name: "energyTarget", val: t.energyTarget },
              { label: "Monthly revenue target ($)", name: "monthlyRevenueTarget", val: t.monthlyRevenueTarget },
            ].map(({ label, name, val }) => (
              <div key={name}>
                <label className="block text-xs text-[#5C5550] mb-1.5">{label}</label>
                <input
                  type="number" name={name} defaultValue={val} step="any"
                  className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
                />
              </div>
            ))}
            {targetState.error && <p className="col-span-2 text-xs text-[#9B2335]">{targetState.error}</p>}
            {targetState.success && <p className="col-span-2 text-xs text-[#2D6A4F]">{targetState.success}</p>}
            <div className="col-span-2 flex justify-end">
              <button
                type="submit" disabled={targetPending}
                className="px-5 py-2.5 text-xs tracking-[0.1em] uppercase bg-[#1A1714] text-[#FAFAF8] rounded-2xl hover:bg-[#2C2520] disabled:opacity-40 transition-colors"
              >
                {targetPending ? "Saving…" : "Save targets"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scorecard form */}
      <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6">
        <form key={weekOffset} action={submitAction} className="space-y-5">
          <input type="hidden" name="weekStart" value={selectedWeekIso} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">

            <SectionHeading label="Revenue & Sales" />
            <Field label="Revenue this week ($)" name="revenue" type="currency" value={selectedRow?.revenue} target={t.revenueTarget} />
            <Field label="New leads / enquiries" name="leads" value={selectedRow?.leads} target={t.leadsTarget} min={0} />
            <Field label="Sales calls booked" name="callsBooked" value={selectedRow?.callsBooked} target={t.callsBookedTarget} min={0} />
            <Field label="Sales calls converted" name="callsConverted" value={selectedRow?.callsConverted} target={t.callsConvertedTarget} min={0} />
            <SimpleField label="Current clients" name="currentClients" value={selectedRow?.currentClients} />
            <SimpleField label="Cancellations / pauses" name="cancellations" value={selectedRow?.cancellations} />
            <div className="col-span-2">
              <SimpleField label="Average value of new clients ($)" name="avgClientValue" value={selectedRow?.avgClientValue} prefix="$" step={0.01} />
            </div>

            <SectionHeading label="Content & Visibility" />
            <Field label="Content pieces posted" name="contentPieces" value={selectedRow?.contentPieces} target={t.contentTarget} min={0} />
            <Field label="Enquiries from content" name="contentEnquiries" value={selectedRow?.contentEnquiries} target={1} min={0} />
            <SimpleField label="Follower growth" name="followerGrowth" value={selectedRow?.followerGrowth} />
            <TextAreaField label="Best performing post" name="bestPerformingPost" value={selectedRow?.bestPerformingPost} />

            <SectionHeading label="Operations & Energy" />
            <Field label="Hours worked" name="hoursWorked" value={selectedRow?.hoursWorked} target={t.hoursTarget} min={0} step={0.5} />
            <div className="col-span-2">
              <Field label="Energy score" name="energyScore" value={selectedRow?.energyScore} target={t.energyTarget} min={1} max={10} />
            </div>
            <TextAreaField label="Biggest win last week" name="biggestWin" value={selectedRow?.biggestWin} />
            <TextAreaField label="Biggest block or friction point" name="biggestBlock" value={selectedRow?.biggestBlock} />

          </div>

          {submitState.error && <p className="text-xs text-[#9B2335]">{submitState.error}</p>}
          {submitState.success && <p className="text-xs text-[#2D6A4F]">{submitState.success}</p>}

          <div className="flex justify-end">
            <button
              type="submit" disabled={pending}
              className="px-6 py-2.5 text-xs tracking-[0.1em] uppercase bg-[#1A1714] text-[#FAFAF8] rounded-2xl hover:bg-[#2C2520] disabled:opacity-40 transition-colors"
            >
              {pending ? "Saving…" : "Save scorecard"}
            </button>
          </div>
        </form>
      </div>

      {/* History toggle */}
      {history.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d={showHistory ? "M1 7l4-4 4 4" : "M1 3l4 4 4-4"} />
            </svg>
            {showHistory ? "Hide history" : `Show ${history.length} previous weeks`}
          </button>

          {showHistory && (
            <div className="mt-3 rounded-3xl border border-[#E8E2D9] overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E8E2D9]">
                    {["Week", "Revenue", "Leads", "Calls Bkd", "Converted", "Clients", "Content", "Followers", "Hours", "Energy"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] tracking-[0.1em] uppercase text-[#8C8277] font-normal whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.weekStart.toString()} className="border-b border-[#E8E2D9] last:border-0">
                      <td className="px-4 py-3 text-[#5C5550] whitespace-nowrap">{formatWeekLabel(row.weekStart)}</td>
                      <td className={`px-4 py-3 ${rag(row.revenue, t.revenueTarget)}`}>{row.revenue != null ? `$${row.revenue.toLocaleString("en-AU")}` : "-"}</td>
                      <td className={`px-4 py-3 ${rag(row.leads, t.leadsTarget)}`}>{row.leads ?? "-"}</td>
                      <td className={`px-4 py-3 ${rag(row.callsBooked, t.callsBookedTarget)}`}>{row.callsBooked ?? "-"}</td>
                      <td className={`px-4 py-3 ${rag(row.callsConverted, t.callsConvertedTarget)}`}>{row.callsConverted ?? "-"}</td>
                      <td className="px-4 py-3 text-[#5C5550]">{row.currentClients ?? "-"}</td>
                      <td className={`px-4 py-3 ${rag(row.contentPieces, t.contentTarget)}`}>{row.contentPieces ?? "-"}</td>
                      <td className="px-4 py-3 text-[#5C5550]">{row.followerGrowth != null ? `+${row.followerGrowth}` : "-"}</td>
                      <td className={`px-4 py-3 ${rag(row.hoursWorked, t.hoursTarget)}`}>{row.hoursWorked ?? "-"}</td>
                      <td className={`px-4 py-3 ${rag(row.energyScore, t.energyTarget)}`}>{row.energyScore ?? "-"}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
