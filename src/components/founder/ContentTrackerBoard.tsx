"use client";

import { useState, useTransition } from "react";
import { updateTrackerStatusAction, updateTrackerNotesAction } from "@/app/(founder)/content-tracker/actions";

type TrackerStatus = "not_started" | "in_progress" | "done";

type ClientRow = {
  clientProfileId: string;
  name: string;
  business: string;
  planStatus: TrackerStatus;
  storiesStatus: TrackerStatus;
  reelsStatus: TrackerStatus;
  notes: string;
};

const STATUS_OPTIONS: { value: TrackerStatus; label: string; color: string; bg: string; dot: string }[] = [
  { value: "not_started", label: "Not Started", color: "#b0a89e", bg: "transparent",  dot: "#b0a89e" },
  { value: "in_progress", label: "In Progress", color: "#8C735A", bg: "#F5EFE5",      dot: "#8C735A" },
  { value: "done",        label: "Done",        color: "#2D6A4F", bg: "#E5F2EC",      dot: "#2D6A4F" },
];

function StatusCycle({
  clientProfileId,
  month,
  field,
  value,
}: {
  clientProfileId: string;
  month: string;
  field: "planStatus" | "storiesStatus" | "reelsStatus";
  value: TrackerStatus;
}) {
  const [current, setCurrent] = useState<TrackerStatus>(value);
  const [, startTransition] = useTransition();

  const opt = STATUS_OPTIONS.find((o) => o.value === current)!;
  const nextOpt = STATUS_OPTIONS[(STATUS_OPTIONS.findIndex((o) => o.value === current) + 1) % STATUS_OPTIONS.length];

  function handleClick() {
    const next = nextOpt.value;
    setCurrent(next);
    startTransition(() => updateTrackerStatusAction(clientProfileId, month, field, next));
  }

  return (
    <button
      onClick={handleClick}
      title={`Click to set: ${nextOpt.label}`}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] tracking-[0.08em] border transition-all hover:opacity-80 whitespace-nowrap"
      style={{ color: opt.color, background: opt.bg, borderColor: opt.dot + "55" }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: opt.dot }} />
      {opt.label}
    </button>
  );
}

function NotesCell({
  clientProfileId,
  month,
  value,
}: {
  clientProfileId: string;
  month: string;
  value: string;
}) {
  const [notes, setNotes] = useState(value);
  const [, startTransition] = useTransition();

  function handleBlur() {
    startTransition(() => updateTrackerNotesAction(clientProfileId, month, notes));
  }

  return (
    <input
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={handleBlur}
      placeholder="Notes..."
      className="w-full text-xs text-[#1A1917] placeholder:text-[#b0a89e] bg-transparent focus:outline-none"
    />
  );
}

export function ContentTrackerBoard({
  initialRows,
  month,
  onMonthChange,
}: {
  initialRows: ClientRow[];
  month: string;
  onMonthChange: (m: string) => void;
}) {
  const [rows] = useState<ClientRow[]>(initialRows);

  const done = rows.filter((r) => r.planStatus === "done" && r.storiesStatus === "done").length;
  const inProgress = rows.filter(
    (r) =>
      (r.planStatus === "in_progress" || r.storiesStatus === "in_progress") &&
      !(r.planStatus === "done" && r.storiesStatus === "done")
  ).length;
  const notStarted = rows.filter((r) => r.planStatus === "not_started" && r.storiesStatus === "not_started").length;

  return (
    <div className="space-y-6">
      {/* Month selector + summary */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const [y, m] = month.split("-").map(Number);
              const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
              onMonthChange(prev);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a7268] hover:text-[#1A1917] hover:bg-[#F5F3EF] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M9 11L5 7l4-4"/></svg>
          </button>
          <span className="px-3 text-sm text-[#1A1917] min-w-[140px] text-center">
            {new Date(Number(month.split("-")[0]), Number(month.split("-")[1]) - 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => {
              const [y, m] = month.split("-").map(Number);
              const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
              onMonthChange(next);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a7268] hover:text-[#1A1917] hover:bg-[#F5F3EF] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M5 3l4 4-4 4"/></svg>
          </button>
        </div>

        <div className="flex gap-6">
          {[
            { label: "Done", count: done, color: "#2D6A4F" },
            { label: "In Progress", count: inProgress, color: "#8C735A" },
            { label: "Not Started", count: notStarted, color: "#b0a89e" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-[300]" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[9px] tracking-[0.1em] text-[#b0a89e]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-[#EDEBE6] px-6 py-16 text-center">
          <p className="text-sm text-[#b0a89e]">No social clients yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#EDEBE6] overflow-hidden">
          {/* Header */}
          <div className="grid gap-0 border-b border-[#EDEBE6] bg-[#F5F3EF]" style={{ gridTemplateColumns: "1fr 130px 130px 130px 1fr" }}>
            {["Client", "Social Plan", "Stories", "Reels", "Notes"].map((h) => (
              <div key={h} className="px-4 py-2.5 text-[9px] tracking-[0.18em] text-[#7a7268] uppercase">
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.clientProfileId}
              className={`grid gap-0 items-center ${i > 0 ? "border-t border-[#EDEBE6]" : ""}`}
              style={{ gridTemplateColumns: "1fr 130px 130px 130px 1fr" }}
            >
              <div className="px-4 py-3">
                <p className="text-sm text-[#1A1917]">{row.name}</p>
                <p className="text-[10px] text-[#b0a89e]">{row.business}</p>
              </div>
              <div className="px-3 py-3">
                <StatusCycle clientProfileId={row.clientProfileId} month={month} field="planStatus" value={row.planStatus} />
              </div>
              <div className="px-3 py-3">
                <StatusCycle clientProfileId={row.clientProfileId} month={month} field="storiesStatus" value={row.storiesStatus} />
              </div>
              <div className="px-3 py-3">
                <StatusCycle clientProfileId={row.clientProfileId} month={month} field="reelsStatus" value={row.reelsStatus} />
              </div>
              <div className="px-4 py-3 border-l border-[#EDEBE6]">
                <NotesCell clientProfileId={row.clientProfileId} month={month} value={row.notes} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[#b0a89e]">Click any status to cycle through Not Started → In Progress → Done. Notes save automatically.</p>
    </div>
  );
}
