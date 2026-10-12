"use client";

import { useTransition, useState } from "react";
import { advanceWeekAction, setPhaseAction } from "@/app/(founder)/clients/[id]/generate/actions";

export function PhaseControls({
  clientProfileId,
  currentMonth,
  currentWeek,
  startDate,
}: {
  clientProfileId: string;
  currentMonth: number;
  currentWeek: number;
  startDate?: Date | string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showEdit, setShowEdit] = useState(false);

  function handleAdvance() {
    startTransition(() => advanceWeekAction(clientProfileId));
  }

  function handleSetPhase(formData: FormData) {
    startTransition(() => setPhaseAction(clientProfileId, formData));
    setShowEdit(false);
  }

  // Calendar month the client is currently in
  const calendarLabel = (() => {
    if (!startDate) return null;
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + currentMonth);
    return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  })();

  // Start date formatted for display
  const startDateLabel = startDate
    ? new Date(startDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  // Start date formatted for the date input (YYYY-MM-DD)
  const startDateValue = startDate
    ? new Date(startDate).toISOString().slice(0, 10)
    : "";

  const nextLabel = currentWeek < 4
    ? `Advance to Week ${currentWeek + 1}`
    : `Advance to Month ${currentMonth + 1}`;

  return (
    <div
      className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-5"
      style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Programme</h3>
        <button
          onClick={() => setShowEdit((v) => !v)}
          className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors"
        >
          {showEdit ? "Cancel" : "Edit"}
        </button>
      </div>

      {!showEdit ? (
        <div className="space-y-4">
          <div>
            <p className="font-display text-3xl font-light text-[#1A1714]">
              Month {currentMonth}
            </p>
            <p className="text-sm text-[#5C5550] mt-0.5">
              Week {currentWeek} of 4
              {calendarLabel && (
                <span className="text-[#8C8277]"> · {calendarLabel}</span>
              )}
            </p>
            {startDateLabel && (
              <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mt-2">
                Started {startDateLabel}
              </p>
            )}
          </div>

          {/* Week progress bar */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((w) => (
              <div
                key={w}
                className={`h-1 flex-1 rounded-full transition-all ${
                  w < currentWeek
                    ? "bg-[#C8B89A]"
                    : w === currentWeek
                    ? "bg-[#C8B89A]/50"
                    : "bg-[#E8E2D9]"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <form action={handleSetPhase} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">
              Start date
            </label>
            <input
              name="startDate"
              type="date"
              defaultValue={startDateValue}
              required
              className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
            <p className="text-[10px] text-[#8C8277] leading-relaxed">
              Month and week will be calculated automatically from this date.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 text-[10px] tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}
