"use client";

import { useState } from "react";
import { GoalUpdateForm, GoalEditForm, GoalDeleteButton } from "./GoalUpdateForm";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  baselineNote: string | null;
  targetNote: string | null;
  progressPercent: number;
  status: string;
  progressNotes: { id: string; note: string; progress: number; createdAt: string }[];
};

export function GoalCardClientWrapper({ goal }: { goal: Goal }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className={`rounded-3xl border p-6 bg-[#FFFFFF] ${goal.progressPercent >= 100 ? "border-[#2D6A4F]/30" : "border-[#E8E2D9]"}`}>
      {editing ? (
        <GoalEditForm
          goal={goal}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-base text-[#1A1714]">{goal.title}</h3>
              {goal.description && (
                <p className="text-xs text-[#5C5550] mt-0.5">{goal.description}</p>
              )}
            </div>
            <div className="flex items-start gap-4 shrink-0">
              <span className="font-display text-2xl font-thin tracking-wide text-[#C8B89A]">
                {goal.progressPercent}%
              </span>
              <button
                onClick={() => setEditing(true)}
                className="mt-1 text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[#F2EDE4] rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${goal.progressPercent >= 100 ? "bg-[#2D6A4F]" : "bg-[#C8B89A]"}`}
              style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
            />
          </div>

          {/* Before / after markers */}
          {(goal.baselineNote || goal.targetNote) && (
            <div className="flex items-start justify-between mb-4">
              {goal.baselineNote && (
                <div>
                  <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277] mb-0.5">Starting point</p>
                  <p className="text-xs text-[#5C5550]">{goal.baselineNote}</p>
                </div>
              )}
              {goal.targetNote && (
                <div className="text-right">
                  <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277] mb-0.5">Success looks like</p>
                  <p className="text-xs text-[#5C5550]">{goal.targetNote}</p>
                </div>
              )}
            </div>
          )}

          {/* Progress notes */}
          {goal.progressNotes.length > 0 && (
            <div className="space-y-2 border-t border-[#E8E2D9] pt-3 mb-2">
              <p className="text-[9px] tracking-[0.12em] uppercase text-[#8C8277]">Progress notes</p>
              {goal.progressNotes.map((note) => (
                <div key={note.id} className="flex items-start gap-3">
                  <span className="text-[10px] text-[#8C8277] mt-0.5 flex-shrink-0 tabular-nums">
                    {new Date(note.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </span>
                  <p className="text-xs text-[#5C5550] leading-5">{note.note}</p>
                  <span className="text-[9px] text-[#C8B89A] shrink-0 mt-0.5">{note.progress}%</span>
                </div>
              ))}
            </div>
          )}

          {goal.progressPercent >= 100 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
              <span className="text-xs text-[#2D6A4F] tracking-wide">Goal achieved</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <GoalUpdateForm goalId={goal.id} currentProgress={goal.progressPercent} />
            <GoalDeleteButton goalId={goal.id} />
          </div>
        </>
      )}
    </div>
  );
}
