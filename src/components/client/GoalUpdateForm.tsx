"use client";

import { useActionState, useRef, useEffect, useState, useTransition } from "react";
import { addGoalProgressNoteAction, editGoalAction, deleteGoalAction, addGoalAction } from "@/app/(client)/goals/actions";

// ── Progress note form ──────────────────────────────────────────────────────

export function GoalUpdateForm({
  goalId,
  currentProgress,
}: {
  goalId: string;
  currentProgress: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addGoalProgressNoteAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.success]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 text-[10px] tracking-[0.1em] uppercase text-[#C8B89A] hover:text-[#1A1714] transition-colors"
      >
        + Add update
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-3 border-t border-[#E8E2D9] pt-4">
      <input type="hidden" name="goalId" value={goalId} />

      <div className="flex items-center gap-3">
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] w-20 shrink-0">Progress</label>
        <input
          name="progress"
          type="range"
          min={0}
          max={100}
          defaultValue={currentProgress}
          className="flex-1 accent-[#C8B89A] h-1"
        />
        <span className="text-xs text-[#8C8277] w-8 text-right tabular-nums">{currentProgress}%</span>
      </div>

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1.5">Note</label>
        <textarea
          name="note"
          required
          placeholder="What progress have you made? What's changed?"
          rows={2}
          className="w-full rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/60 resize-none leading-5"
        />
      </div>

      {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="text-[10px] tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] hover:bg-[#2C2520] px-4 py-1.5 rounded-xl transition-colors disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save update"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Full goal edit form ─────────────────────────────────────────────────────

export function GoalEditForm({
  goal,
  onCancel,
}: {
  goal: { id: string; title: string; description?: string | null; targetNote?: string | null; progressPercent: number };
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(editGoalAction, {});
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) onCancel();
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-3 pt-2">
      <input type="hidden" name="goalId" value={goal.id} />

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">Goal</label>
        <input
          name="title"
          required
          defaultValue={goal.title}
          className="w-full rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/60"
        />
      </div>

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">Description</label>
        <input
          name="description"
          defaultValue={goal.description ?? ""}
          placeholder="Optional detail…"
          className="w-full rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/60"
        />
      </div>

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">Success looks like</label>
        <input
          name="targetNote"
          defaultValue={goal.targetNote ?? ""}
          placeholder="What does achieving this goal look like?"
          className="w-full rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/60"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] w-20 shrink-0">Progress</label>
        <input
          name="progress"
          type="number"
          min={0}
          max={100}
          defaultValue={goal.progressPercent}
          className="w-20 rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/60 text-center"
        />
        <span className="text-xs text-[#8C8277]">%</span>
      </div>

      {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="text-[10px] tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] hover:bg-[#2C2520] px-4 py-1.5 rounded-xl transition-colors disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Delete button ───────────────────────────────────────────────────────────

export function GoalDeleteButton({ goalId }: { goalId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#9B2335]">Remove this goal?</span>
        <button
          onClick={() => startTransition(() => deleteGoalAction(goalId))}
          disabled={pending}
          className="text-[10px] tracking-[0.08em] uppercase text-[#9B2335] hover:opacity-70 disabled:opacity-40"
        >
          {pending ? "Removing…" : "Yes, remove"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#1A1714]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#9B2335] transition-colors"
    >
      Remove
    </button>
  );
}

// ── Add goal form ───────────────────────────────────────────────────────────

export function AddGoalForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addGoalAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) { formRef.current?.reset(); setOpen(false); }
  }, [state.success]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-3xl border border-dashed border-[#C8B89A]/40 px-6 py-5 text-xs tracking-[0.1em] uppercase text-[#C8B89A] hover:border-[#C8B89A] hover:bg-[#C8B89A]/4 transition-all"
      >
        + Add a goal
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-4">
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">New goal</p>

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">Goal title</label>
        <input
          name="title"
          required
          placeholder="What do you want to achieve?"
          className="w-full rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/60"
        />
      </div>

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">Success looks like</label>
        <input
          name="targetNote"
          placeholder="What does achieving this look like?"
          className="w-full rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/60"
        />
      </div>

      {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="text-[10px] tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] hover:bg-[#2C2520] px-4 py-1.5 rounded-xl transition-colors disabled:opacity-40">
          {pending ? "Adding…" : "Add goal"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

